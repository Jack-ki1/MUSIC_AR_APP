from __future__ import annotations

import json
import os
import time
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional, Tuple

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CATALOGUE_PATH = os.path.join(_BASE_DIR, "provider_catalogue.json")

def _load_catalogue() -> List[Dict[str, Any]]:
    try:
        with open(CATALOGUE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except Exception:
        return []

CATALOGUE = _load_catalogue()
CATALOGUE_BY_ID = {p.get("id"): p for p in CATALOGUE if p.get("id")}

# Providers with implemented fetch logic (backend-side). Others are clearly outlined with status.
PUBLIC_FETCHERS = {
    "itunes", "deezer", "musicbrainz", "wikipedia", "wikidata", "audius",
    "jamendo", "lastfm", "theaudiodb", "youtube", "spotify", "discogs",
}
MANUAL_OR_LICENSED_ACCESS = {"manual", "licensed", "partner", "research", "proprietary", "export"}

def _http_get_json(url: str, headers: Optional[Dict[str, str]] = None, timeout: int = 8) -> Any:
    req = urllib.request.Request(url, headers=headers or {"User-Agent": "BreakoutRadar/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read().decode("utf-8", errors="replace")
    return json.loads(raw)

def _result(provider_id: str, status: str, message: str, items: Optional[List[Dict[str, Any]]] = None, meta: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return {
        "provider": provider_id,
        "status": status,
        "message": message,
        "items": items or [],
        "count": len(items or []),
        "fetchedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "meta": meta or {},
    }

def _get_cred(creds: Dict[str, Any], provider_id: str, key: str) -> str:
    if not creds:
        return ""
    # flat "provider_key" or nested {provider:{key:v}}
    v = creds.get(f"{provider_id}_{key}") or creds.get(key)
    if v is None and isinstance(creds.get(provider_id), dict):
        v = creds[provider_id].get(key)
    return str(v or "").strip()

def fetch_itunes(query: str, limit: int, creds: Dict[str, Any]) -> Dict[str, Any]:
    url = "https://itunes.apple.com/search?" + urllib.parse.urlencode({"term": query, "entity": "song", "limit": str(limit)})
    data = _http_get_json(url)
    items = []
    for r in (data.get("results") or [])[:limit]:
        items.append({
            "source": "itunes",
            "artist": r.get("artistName"),
            "track": r.get("trackName"),
            "genre": r.get("primaryGenreName"),
            "releaseDate": (r.get("releaseDate") or "").split("T")[0],
            "previewUrl": r.get("previewUrl"),
            "artworkUrl": (r.get("artworkUrl100") or "").replace("100x100bb", "300x300bb"),
            "url": r.get("trackViewUrl"),
        })
    return _result("itunes", "ok", "Fetched catalogue results from iTunes Search API.", items)

def fetch_deezer(query: str, limit: int, creds: Dict[str, Any]) -> Dict[str, Any]:
    url = "https://api.deezer.com/search/artist?" + urllib.parse.urlencode({"q": query, "limit": str(limit)})
    data = _http_get_json(url)
    items = []
    for r in (data.get("data") or [])[:limit]:
        items.append({
            "source": "deezer",
            "artist": r.get("name"),
            "id": r.get("id"),
            "fans": r.get("nb_fan"),
            "albums": r.get("nb_album"),
            "url": r.get("link"),
            "picture": r.get("picture_medium") or r.get("picture"),
        })
    return _result("deezer", "ok", "Fetched artist results from Deezer public API.", items)

def fetch_musicbrainz(query: str, limit: int, creds: Dict[str, Any]) -> Dict[str, Any]:
    url = "https://musicbrainz.org/ws/2/artist/?" + urllib.parse.urlencode({"query": query, "fmt": "json", "limit": str(limit)})
    data = _http_get_json(url, headers={"User-Agent": "BreakoutRadar/1.0 (aandr-intel@example.com)", "Accept": "application/json"})
    items = []
    for r in (data.get("artists") or [])[:limit]:
        items.append({
            "source": "musicbrainz",
            "artist": r.get("name"),
            "id": r.get("id"),
            "country": r.get("country"),
            "type": r.get("type"),
            "disambiguation": r.get("disambiguation"),
            "score": r.get("score"),
        })
    return _result("musicbrainz", "ok", "Fetched artist identities from MusicBrainz.", items)

def fetch_wikipedia(query: str, limit: int, creds: Dict[str, Any]) -> Dict[str, Any]:
    title = (query or "").strip().replace(" ", "_")
    if not title:
        return _result("wikipedia", "error", "Query required.")
    url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(title)
    try:
        data = _http_get_json(url)
        item = {
            "source": "wikipedia",
            "title": data.get("title"),
            "description": data.get("description"),
            "extract": data.get("extract"),
            "url": (data.get("content_urls") or {}).get("desktop", {}).get("page"),
            "thumbnail": (data.get("thumbnail") or {}).get("source"),
        }
        return _result("wikipedia", "ok", "Fetched page summary from Wikipedia.", [item] if data.get("title") else [])
    except Exception as e:
        return _result("wikipedia", "not_found", f"No summary found or request failed: {e}", [])

def fetch_wikidata(query: str, limit: int, creds: Dict[str, Any]) -> Dict[str, Any]:
    url = "https://www.wikidata.org/w/api.php?" + urllib.parse.urlencode({
        "action": "wbsearchentities", "search": query, "language": "en", "format": "json", "limit": str(limit), "type": "item"
    })
    data = _http_get_json(url)
    items = []
    for r in (data.get("search") or [])[:limit]:
        items.append({
            "source": "wikidata",
            "id": r.get("id"),
            "label": r.get("label"),
            "description": r.get("description"),
            "url": r.get("concepturi") or (("https:" + r.get("url")) if r.get("url","").startswith("//") else r.get("url")),
        })
    return _result("wikidata", "ok", "Fetched entity matches from Wikidata.", items)

def fetch_audius(query: str, limit: int, creds: Dict[str, Any]) -> Dict[str, Any]:
    # Public Audius API (discovery provider)
    try:
        host_data = _http_get_json("https://api.audius.co")
        hosts = host_data.get("data") or ["https://discoveryprovider.audius.co"]
        host = hosts[0] if hosts else "https://discoveryprovider.audius.co"
        app = _get_cred(creds, "audius", "app_name") or "BreakoutRadar"
        url = host.rstrip("/") + "/v1/users/search?" + urllib.parse.urlencode({"query": query, "app_name": app})
        data = _http_get_json(url)
        items = []
        for r in (data.get("data") or [])[:limit]:
            items.append({
                "source": "audius",
                "artist": r.get("name"),
                "handle": r.get("handle"),
                "id": r.get("id"),
                "followers": r.get("follower_count"),
                "tracks": r.get("track_count"),
                "verified": r.get("is_verified"),
            })
        return _result("audius", "ok", "Fetched creator profiles from Audius.", items)
    except Exception as e:
        return _result("audius", "error", f"Audius fetch failed: {e}", [])

def fetch_lastfm(query: str, limit: int, creds: Dict[str, Any]) -> Dict[str, Any]:
    api_key = _get_cred(creds, "lastfm", "api_key")
    if not api_key:
        return _result("lastfm", "needs_credentials", "API key required (configured in Settings > Data Providers).", [])
    url = "https://ws.audioscrobbler.com/2.0/?" + urllib.parse.urlencode({
        "method": "artist.search", "artist": query, "api_key": api_key, "format": "json", "limit": str(limit)
    })
    data = _http_get_json(url)
    matches = (((data.get("results") or {}).get("artistmatches") or {}).get("artist")) or []
    if isinstance(matches, dict): matches = [matches]
    items = []
    for r in matches[:limit]:
        items.append({"source": "lastfm", "artist": r.get("name"), "listeners": r.get("listeners"), "url": r.get("url"), "mbid": r.get("mbid")})
    return _result("lastfm", "ok", "Fetched artist search results from Last.fm.", items)

def fetch_theaudiodb(query: str, limit: int, creds: Dict[str, Any]) -> Dict[str, Any]:
    api_key = _get_cred(creds, "theaudiodb", "api_key") or "2"
    url = f"https://www.theaudiodb.com/api/v1/json/{api_key}/search.php?" + urllib.parse.urlencode({"s": query})
    data = _http_get_json(url)
    items = []
    for r in (data.get("artists") or [])[:limit]:
        items.append({
            "source": "theaudiodb", "artist": r.get("strArtist"), "id": r.get("idArtist"),
            "genre": r.get("strGenre"), "style": r.get("strStyle"), "country": r.get("strCountry"),
            "formed": r.get("intFormedYear"), "website": r.get("strWebsite"),
        })
    return _result("theaudiodb", "ok", "Fetched artist metadata from TheAudioDB.", items)

def fetch_spotify(query: str, limit: int, creds: Dict[str, Any]) -> Dict[str, Any]:
    client_id = _get_cred(creds, "spotify", "client_id")
    client_secret = _get_cred(creds, "spotify", "client_secret")
    if not client_id or not client_secret:
        return _result("spotify", "needs_credentials", "client_id and client_secret required.", [])
    # client credentials token
    try:
        token_url = "https://accounts.spotify.com/api/token"
        body = urllib.parse.urlencode({"grant_type": "client_credentials"}).encode()
        import base64
        auth = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
        req = urllib.request.Request(token_url, data=body, headers={"Authorization": f"Basic {auth}", "Content-Type": "application/x-www-form-urlencoded"})
        with urllib.request.urlopen(req, timeout=8) as resp:
            tok = json.loads(resp.read().decode())
        access = tok.get("access_token")
        if not access:
            return _result("spotify", "error", "Token exchange failed (check credentials/app mode).", [])
        search_url = "https://api.spotify.com/v1/search?" + urllib.parse.urlencode({"q": query, "type": "artist", "limit": str(limit)})
        data = _http_get_json(search_url, headers={"Authorization": f"Bearer {access}"})
        items = []
        for r in (((data.get("artists") or {}).get("items")) or [])[:limit]:
            items.append({"source": "spotify", "artist": r.get("name"), "id": r.get("id"), "followers": (r.get("followers") or {}).get("total"), "popularity": r.get("popularity"), "genres": r.get("genres"), "url": (r.get("external_urls") or {}).get("spotify")})
        return _result("spotify", "ok", "Fetched artist search from Spotify Web API.", items)
    except Exception as e:
        return _result("spotify", "error", f"Spotify fetch failed: {e}", [])

def fetch_youtube(query: str, limit: int, creds: Dict[str, Any]) -> Dict[str, Any]:
    api_key = _get_cred(creds, "youtube", "api_key")
    if not api_key:
        return _result("youtube", "needs_credentials", "Google API key required.", [])
    url = "https://www.googleapis.com/youtube/v3/search?" + urllib.parse.urlencode({
        "part": "snippet", "q": query, "type": "channel", "maxResults": str(min(limit, 10)), "key": api_key
    })
    data = _http_get_json(url)
    items = []
    for r in (data.get("items") or [])[:limit]:
        sn = r.get("snippet") or {}
        items.append({"source": "youtube", "channel": sn.get("title"), "channelId": (r.get("id") or {}).get("channelId"), "description": sn.get("description"), "publishedAt": sn.get("publishedAt"), "thumbnail": ((sn.get("thumbnails") or {}).get("default") or {}).get("url")})
    return _result("youtube", "ok", "Fetched channel search results from YouTube Data API.", items)

def fetch_discogs(query: str, limit: int, creds: Dict[str, Any]) -> Dict[str, Any]:
    token = _get_cred(creds, "discogs", "token")
    headers = {"User-Agent": "BreakoutRadar/1.0"}
    if token:
        headers["Authorization"] = f"Discogs token={token}"
    url = "https://api.discogs.com/database/search?" + urllib.parse.urlencode({"q": query, "type": "artist", "per_page": str(limit)})
    try:
        data = _http_get_json(url, headers=headers)
        items = []
        for r in (data.get("results") or [])[:limit]:
            items.append({"source": "discogs", "artist": r.get("title"), "id": r.get("id"), "url": r.get("resource_url"), "thumb": r.get("thumb")})
        status = "ok" if token else "limited"
        msg = "Fetched artist search from Discogs." + ("" if token else " (unauthenticated; provide token for higher limits)")
        return _result("discogs", status, msg, items)
    except Exception as e:
        if not token:
            return _result("discogs", "needs_credentials", "Token recommended/required for reliable access.", [])
        return _result("discogs", "error", f"Discogs fetch failed: {e}", [])

FETCHERS = {
    "itunes": fetch_itunes,
    "apple_music": fetch_itunes,  # catalogue discovery via public iTunes search
    "deezer": fetch_deezer,
    "musicbrainz": fetch_musicbrainz,
    "wikipedia": fetch_wikipedia,
    "wikidata": fetch_wikidata,
    "audius": fetch_audius,
    "lastfm": fetch_lastfm,
    "theaudiodb": fetch_theaudiodb,
    "spotify": fetch_spotify,
    "youtube": fetch_youtube,
    "discogs": fetch_discogs,
    "knowledge_graph": lambda q,l,c: _result("knowledge_graph", "needs_credentials", "Google API key required (not fetched without key).", []),
    "jamendo": lambda q,l,c: _result("jamendo", "needs_credentials", "Client ID required for Jamendo API requests.", []),
    "soundcloud": lambda q,l,c: _result("soundcloud", "needs_credentials", "Approved app credentials required.", []),
    "ticketmaster": lambda q,l,c: _result("ticketmaster", "needs_credentials", "API key required for Ticketmaster Discovery.", []),
    "musixmatch": lambda q,l,c: _result("musixmatch", "needs_credentials", "API key required.", []),
}

def get_provider_outline(provider_id: str) -> Dict[str, Any]:
    p = CATALOGUE_BY_ID.get(provider_id) or {"id": provider_id}
    access = (p.get("access") or "").lower()
    has_impl = provider_id in FETCHERS
    if has_impl:
        fetch_mode = "implemented"
    elif access in MANUAL_OR_LICENSED_ACCESS:
        fetch_mode = "manual_or_licensed"
    else:
        fetch_mode = "outlined"
    return {
        "id": provider_id,
        "name": p.get("name", provider_id),
        "category": p.get("category"),
        "access": p.get("access"),
        "description": p.get("description"),
        "docs_url": p.get("docs_url"),
        "fields": p.get("fields") or [],
        "fetchMode": fetch_mode,
        "implemented": has_impl,
        "access_note": p.get("access_note") or p.get("accessNote"),
    }

def list_providers(config: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    config = config or {}
    enabled_map = (config.get("enabled") or {}) if isinstance(config, dict) else {}
    creds = (config.get("credentials") or {}) if isinstance(config, dict) else {}
    out = []
    for p in CATALOGUE:
        pid = p.get("id")
        base = get_provider_outline(pid)
        base["enabled"] = bool(enabled_map.get(pid, p.get("enabled", False)))
        base["configured"] = True  # default; refined per fields
        fields = base.get("fields") or []
        missing = []
        for f in fields:
            key = f.get("key")
            if key and not _get_cred(creds, pid, key):
                missing.append(key)
        base["missing_fields"] = missing
        base["configured"] = len(missing) == 0
        if base["enabled"] and missing and fields:
            base["runtimeStatus"] = "needs_credentials"
        elif base["enabled"] and base["fetchMode"] == "implemented":
            base["runtimeStatus"] = "ready"
        elif base["enabled"] and base["fetchMode"] == "manual_or_licensed":
            base["runtimeStatus"] = "manual_or_licensed"
        elif base["enabled"]:
            base["runtimeStatus"] = "outlined"
        else:
            base["runtimeStatus"] = "disabled"
        out.append(base)
    return out

def fetch_provider(provider_id: str, query: str, limit: int = 10, creds: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    creds = creds or {}
    p = CATALOGUE_BY_ID.get(provider_id)
    if not p:
        return _result(provider_id, "unknown", "Provider not found in catalogue.", [])
    fetcher = FETCHERS.get(provider_id)
    if fetcher:
        try:
            return fetcher(query, limit, creds)
        except Exception as e:
            return _result(provider_id, "error", f"Fetch error: {e}", [])
    access = (p.get("access") or "").lower()
    if access in MANUAL_OR_LICENSED_ACCESS or access == "manual":
        return _result(provider_id, "manual_or_licensed", "No automated public fetch. Provide manual feeds/exports or licensed access as configured.", [])
    return _result(provider_id, "outlined", "Fetch adapter outlined; implementation pending for this provider's access mode.", [], {"docs_url": p.get("docs_url"), "access": p.get("access")})

def fetch_from_enabled(query: str, limit: int, config: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    config = config or {}
    enabled_map = config.get("enabled") or {}
    creds = config.get("credentials") or {}
    providers = []
    for p in CATALOGUE:
        pid = p.get("id")
        if enabled_map.get(pid, p.get("enabled", False)):
            providers.append(pid)
    # always include core public fetchers if none explicitly enabled
    if not providers:
        providers = ["itunes", "deezer", "musicbrainz", "wikipedia", "wikidata"]
    results = []
    summary = {"ok": 0, "needs_credentials": 0, "manual_or_licensed": 0, "outlined": 0, "error": 0}
    for pid in providers[:12]:  # cap per run
        r = fetch_provider(pid, query, limit, creds)
        results.append(r)
        st = r.get("status") or "outlined"
        summary[st] = summary.get(st, 0) + 1
    return {"query": query, "providersQueried": [r["provider"] for r in results], "summary": summary, "results": results}
