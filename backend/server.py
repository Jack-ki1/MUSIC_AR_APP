from __future__ import annotations

import json
import logging
import os
import re
import time
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Dict, List, Tuple

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s %(name)s: %(message)s'
)
logger = logging.getLogger('breakout-radar')

try:
    from .data import build_artist_record, compute_artist_rollup, compute_track_avm, generate_timeseries, get_seed_artists, is_legacy_mainstream
    from .store import get_settings, init_db, list_artists, list_decisions, list_scans, save_decision, save_scan, save_settings, upsert_artist, get_provider_config, list_provider_configs, save_provider_config, save_provider_configs_bulk
    from .providers import list_providers, fetch_provider, fetch_from_enabled, get_provider_outline
except ImportError:
    from data import build_artist_record, compute_artist_rollup, compute_track_avm, generate_timeseries, get_seed_artists, is_legacy_mainstream
    from store import get_settings, init_db, list_artists, list_decisions, list_scans, save_decision, save_scan, save_settings, upsert_artist, get_provider_config, list_provider_configs, save_provider_config, save_provider_configs_bulk
    from providers import list_providers, fetch_provider, fetch_from_enabled, get_provider_outline

HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8000"))

REQUEST_LOG = {}


def _json_bytes(data: Any) -> bytes:
    return json.dumps(data, ensure_ascii=False).encode("utf-8")


def _read_json(handler: BaseHTTPRequestHandler) -> Dict[str, Any]:
    length = int(handler.headers.get("Content-Length", "0") or 0)
    if length <= 0:
        return {}
    raw = handler.rfile.read(length)
    try:
        return json.loads(raw.decode("utf-8"))
    except Exception:
        return {}


def _itunes_search(query: str, limit: int = 12) -> List[Dict[str, Any]]:
    url = "https://itunes.apple.com/search?" + urllib.parse.urlencode({"term": query, "entity": "song", "limit": str(limit)})
    req = urllib.request.Request(url, headers={"User-Agent": "BreakoutRadar/1.0"})
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    results = data.get("results") or []
    out = []
    for item in results:
        name = (item.get("artistName") or "").strip()
        if not name or is_legacy_mainstream(name):
            continue
        track_id = item.get("trackId")
        title = item.get("trackName") or "Untitled Track"
        genre = item.get("primaryGenreName") or "East African Music"
        avm = compute_track_avm(track_id, title, genre, track_id)
        out.append({
            "id": track_id,
            "title": title,
            "artistName": name,
            "artistId": item.get("artistId"),
            "collectionName": item.get("collectionName") or "Single Release",
            "previewUrl": item.get("previewUrl") or "",
            "artworkUrl": (item.get("artworkUrl100") or "").replace("100x100bb", "600x600bb"),
            "releaseDate": (item.get("releaseDate") or "").split("T")[0],
            "primaryGenreName": genre,
            "trackViewUrl": item.get("trackViewUrl") or "",
            "trackPrice": item.get("trackPrice"),
            "avm": avm,
        })
    return out


def _build_artist_from_songs(name: str, songs: List[Dict[str, Any]], idx: int = 0) -> Dict[str, Any]:
    primary = songs[0] if songs else {}
    rollup = compute_artist_rollup([s.get("avm", {}) for s in songs])
    discovery = round(min(97.5, 78 + len(songs) * 2.5 + (4 if any(s.get("previewUrl") for s in songs) else 0)), 1)
    combined = round(rollup["aav"] * 0.6 + discovery * 0.4, 1)
    if combined >= 90:
        tier = "PURSUE"
    elif combined >= 82:
        tier = "MEET"
    elif combined >= 72:
        tier = "WATCH"
    else:
        tier = "MORE_EVIDENCE"
    avatar = primary.get("artworkUrl") or "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop"
    return {
        "id": f"cand-{abs(hash(name)) % 10_000_000}",
        "name": name,
        "primaryGenre": primary.get("primaryGenreName") or "Emerging",
        "genres": [primary.get("primaryGenreName") or "Emerging", "East African Indie", "Underground"],
        "country": "Kenya",
        "city": "Nairobi",
        "avatarUrl": avatar,
        "summary": f"Backend-discovered emerging artist candidate aggregated from live catalog signals for '{name}'.",
        "verified": True,
        "discoveryScore": discovery,
        "confidenceScore": 90,
        "artisticScore": round(rollup["aav"] / 20.0, 1),
        "combinedScore": combined,
        "recommendationTier": tier,
        "stage": "Emerging",
        "monthlyListeners": int(18000 + discovery * 650),
        "growthSignal7d": round(16.0 + (idx * 1.7 % 12), 1),
        "growthSignal30d": round(42.0 + (idx * 2.3 % 30), 1),
        "organicConfidence": 93,
        "firstDiscoveredAt": "2026-11-10T00:00:00Z",
        "lastObservedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "tracks": songs,
        "avmRollup": rollup,
        "positiveSignals": [
            f"AVM AAV Rating: {rollup['aav']}/100 across {len(songs)} releases",
            f"Consistency index: {rollup['consistency']}/100",
            "Verified catalog presence with previewable audio",
        ],
        "unresolvedRisks": [
            "Needs additional corroboration across non-catalog sources",
            "Live performance validation pending",
        ],
        "nextBestAction": "Review in Analyze workspace and schedule listening session.",
    }


class Handler(BaseHTTPRequestHandler):
    server_version = "BreakoutRadarBackend/1.0"

    def _send(self, status: int, payload: Any, content_type: str = "application/json; charset=utf-8") -> None:
        body = payload if isinstance(payload, (bytes, bytearray)) else _json_bytes(payload)
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:  # noqa: N802
        self._send(204, b"")

    def do_GET(self) -> None:  # noqa: N802
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        qs = urllib.parse.parse_qs(parsed.query)
        ip = self.address_string()
        REQUEST_LOG[ip] = REQUEST_LOG.get(ip, 0) + 1
        logger.info(f"GET {path} from {ip} count={REQUEST_LOG[ip]}")

        if path in ("/", "/api"):
            return self._send(200, {
                "ok": True,
                "service": "breakout-radar-backend",
                "message": "Breakout Radar Python backend is running.",
                "endpoints": ["/api/health", "/api/artists", "/api/artists/seed", "/api/discovery/search?q=", "/api/providers", "/api/providers/fetch?provider=&q=", "/api/providers/save", "/api/providers/test", "/api/decisions", "/api/settings", "/api/scans", "/api/analytics/timeseries", "/api/avm/track", "/api/avm/artist"]
            })

        if path in ("/api/health", "/health"):
            return self._send(200, {"ok": True, "service": "breakout-radar-backend", "time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())})

        if path == "/api/artists/seed":
            return self._send(200, {"artists": get_seed_artists(), "source": "backend-seed"})

        if path == "/api/artists":
            artists = list_artists()
            if not artists:
                artists = get_seed_artists()
                for a in artists:
                    upsert_artist(a)
            return self._send(200, {"artists": artists, "source": "backend-store"})

        if path == "/api/decisions":
            return self._send(200, {"decisions": list_decisions(200)})

        if path == "/api/scans":
            return self._send(200, {"scans": list_scans(100)})

        if path == "/api/settings":
            settings = get_settings() or {}
            return self._send(200, {"settings": settings})

        if path == "/api/analytics/timeseries":
            base = int(qs.get("baseMonthly", [str(64000)])[0] or 64000)
            horizon = qs.get("horizon", ["90D"])[0]
            return self._send(200, {"points": generate_timeseries(base, horizon)})

        if path == "/api/discovery/search":
            query = (qs.get("q", [""])[0] or "").strip()
            if not query:
                return self._send(400, {"error": "Missing query parameter 'q'"})
            try:
                songs = _itunes_search(query, limit=int(qs.get("limit", ["12"])[0] or 12))
            except Exception as e:
                return self._send(502, {"error": f"Upstream search failed: {e}"})
            grouped: Dict[str, List[Dict[str, Any]]] = {}
            for s in songs:
                grouped.setdefault(s.get("artistName") or "Unknown", []).append(s)
            artists = []
            for i, (name, tracks) in enumerate(grouped.items()):
                if is_legacy_mainstream(name):
                    continue
                artists.append(_build_artist_from_songs(name, tracks[:4], i))
                if len(artists) >= 6:
                    break
            scan = {
                "id": f"scan-{int(time.time()*1000)}",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "query": query,
                "region": qs.get("region", ["East Africa"])[0],
                "candidatesCount": len(artists),
                "durationMs": 0,
                "status": "Completed",
            }
            save_scan(scan)
            for a in artists:
                upsert_artist(a)
            return self._send(200, {"artists": artists, "scan": scan, "source": "backend-itunes"})

        # Provider registry and multi-source fetching (73 sources outlined/implemented)
        if path == "/api/providers":
            stored = list_provider_configs()
            enabled = {k: v.get("enabled", False) for k, v in stored.items()}
            creds = {}
            for k, v in stored.items():
                for ck, cv in (v.get("credentials") or {}).items():
                    creds[f"{k}_{ck}"] = cv
            providers = list_providers({"enabled": enabled, "credentials": creds})
            return self._send(200, {"providers": providers, "count": len(providers), "stored": stored})

        if path.startswith("/api/providers/") and path.endswith("/outline"):
            pid = path[len("/api/providers/"):-len("/outline")].strip("/")
            return self._send(200, {"provider": get_provider_outline(pid)})

        if path == "/api/providers/fetch":
            pid = (qs.get("provider", [""])[0] or "").strip()
            query = (qs.get("q", [""])[0] or qs.get("query", [""])[0] or "").strip()
            limit = int(qs.get("limit", ["10"])[0] or 10)
            if not query:
                return self._send(400, {"error": "Missing query parameter 'q'"})
            stored = list_provider_configs()
            creds = {}
            for k, v in stored.items():
                for ck, cv in (v.get("credentials") or {}).items():
                    creds[f"{k}_{ck}"] = cv
            if pid:
                return self._send(200, {"result": fetch_provider(pid, query, limit, creds)})
            enabled = {k: v.get("enabled", False) for k, v in stored.items()}
            return self._send(200, fetch_from_enabled(query, limit, {"enabled": enabled, "credentials": creds}))

        return self._send(404, {"error": "Not found", "path": path})

    def do_POST(self) -> None:  # noqa: N802
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = _read_json(self)

        if path == "/api/avm/track":
            avm = compute_track_avm(body.get("trackId"), body.get("title", "Untitled"), body.get("genre", "General"), body.get("seed"))
            return self._send(200, {"avm": avm})

        if path == "/api/avm/artist":
            tracks = body.get("tracks") or []
            rollup = compute_artist_rollup(tracks)
            return self._send(200, {"rollup": rollup})

        if path == "/api/artists":
            artists = body.get("artists") or []
            for a in artists:
                upsert_artist(a)
            return self._send(200, {"ok": True, "count": len(artists)})

        if path == "/api/decisions":
            decision = body.get("decision") or body
            if not decision.get("id"):
                decision["id"] = f"dec-{int(time.time()*1000)}"
            save_decision(decision)
            return self._send(200, {"ok": True, "decision": decision})

        if path == "/api/settings":
            settings = body.get("settings") or body
            save_settings(settings)
            return self._send(200, {"ok": True, "settings": settings})

        if path == "/api/scans":
            scan = body.get("scan") or body
            save_scan(scan)
            return self._send(200, {"ok": True, "scan": scan})

        if path == "/api/providers/save":
            # save one or many provider configs
            if isinstance(body.get("providers"), list):
                for p in body.get("providers") or []:
                    save_provider_config(p.get("id") or p.get("provider_id"), bool(p.get("enabled")), p.get("credentials") or {})
                return self._send(200, {"ok": True, "count": len(body.get("providers") or [])})
            pid = body.get("id") or body.get("provider_id")
            if pid:
                save_provider_config(pid, bool(body.get("enabled")), body.get("credentials") or {})
                return self._send(200, {"ok": True, "provider": pid})
            return self._send(400, {"error": "provider id required"})

        if path == "/api/providers/test":
            pid = body.get("provider_id") or body.get("id")
            query = body.get("query") or "emerging Kenya R&B"
            creds = body.get("credentials") or {}
            if not pid:
                return self._send(400, {"error": "provider_id required"})
            # merge stored creds
            stored = get_provider_config(pid)
            merged = {**(stored.get("credentials") or {}), **creds}
            flat = {}
            for k,v in merged.items(): flat[f"{pid}_{k}"] = v
            result = fetch_provider(pid, query, int(body.get("limit") or 3), flat)
            return self._send(200, {"ok": result.get("status") in ("ok","limited"), "result": result})

        if path == "/api/providers/fetch":
            pid = body.get("provider_id") or body.get("id")
            query = body.get("query") or body.get("q") or ""
            limit = int(body.get("limit") or 10)
            if not query:
                return self._send(400, {"error": "query required"})
            stored_all = list_provider_configs()
            creds = {}
            for k, v in stored_all.items():
                for ck, cv in (v.get("credentials") or {}).items():
                    creds[f"{k}_{ck}"] = cv
            if pid:
                return self._send(200, {"result": fetch_provider(pid, query, limit, creds)})
            enabled = {k: v.get("enabled", False) for k, v in stored_all.items()}
            return self._send(200, fetch_from_enabled(query, limit, {"enabled": enabled, "credentials": creds}))

        return self._send(404, {"error": "Not found", "path": path})

    def log_message(self, fmt: str, *args: Any) -> None:
        logger.info(f"{self.address_string()} - {fmt % args}")


def run() -> None:
    init_db()
    # prime seed data
    if not list_artists():
        for a in get_seed_artists():
            upsert_artist(a)
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Breakout Radar backend listening on http://{HOST}:{PORT}")
    print(f"Health: http://localhost:{PORT}/api/health  (use HOST={HOST} for external access)")
    print("Run independently: python3 -m backend.server  OR  python3 backend/server.py")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    run()
