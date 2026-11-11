from __future__ import annotations

import hashlib
import math
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

LEGACY_MAINSTREAM = {
    "diamond platnumz", "sauti sol", "harmonize", "ali kiba", "alikiba",
    "burna boy", "wizkid", "davido", "zuchu", "rayvanny", "mejja",
    "eddy kenzo", "tiwa savage", "rema", "asake", "buju banton", "shaggy",
    "akon", "khaligraph", "otile brown", "nyashinski", "fally ipupa",
    "innoss'b", "bien", "chimano", "savara", "fancy fingers",
}


def is_legacy_mainstream(name: str) -> bool:
    n = (name or "").lower()
    return any(star in n for star in LEGACY_MAINSTREAM)


def _seed_int(*parts: Any) -> int:
    h = hashlib.sha256("|".join(str(p) for p in parts).encode("utf-8")).hexdigest()
    return int(h[:8], 16)


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def compute_track_avm(track_id: Any, title: str, genre: str, seed: int | None = None) -> Dict[str, Any]:
    s = seed if seed is not None else _seed_int(track_id, title, genre)
    rnd = (s % 1000) / 1000.0
    pillar_v = _clamp(0.68 + (rnd - 0.5) * 0.22, 0.45, 0.97)
    pillar_w = _clamp(0.66 + ((s // 7 % 1000) / 1000.0 - 0.5) * 0.22, 0.45, 0.97)
    pillar_s = _clamp(0.65 + ((s // 13 % 1000) / 1000.0 - 0.5) * 0.22, 0.45, 0.97)
    pillar_c = _clamp(0.64 + ((s // 19 % 1000) / 1000.0 - 0.5) * 0.22, 0.45, 0.97)
    wv, ww, ws, wc = 0.30, 0.30, 0.20, 0.20
    production_index = _clamp(45 + ((s // 29 % 100) - 50) * 0.5, 20, 92)
    production_bonus = round(min(3.0, 0.06 * max(0.0, production_index - 50.0)), 2)
    tav = round(100.0 * (wv * pillar_v + ww * pillar_w + ws * pillar_s + wc * pillar_c) + production_bonus, 1)
    tav = _clamp(tav, 0, 100)
    notes_in_20 = round(_clamp(58 + pillar_v * 30 + (rnd - 0.5) * 8, 40, 96), 1)
    return {
        "trackId": track_id,
        "trackTitle": title,
        "genreProfile": genre or "General",
        "tav": tav,
        "tavRange": [round(max(0, tav - 3.5), 1), round(min(100, tav + 3.5), 1)],
        "pillarVocal": round(pillar_v, 4),
        "pillarWriting": round(pillar_w, 4),
        "pillarSongWhole": round(pillar_s, 4),
        "pillarComposition": round(pillar_c, 4),
        "weightsApplied": {"wV": wv, "wW": ww, "wS": ws, "wC": wc},
        "productionIndex": round(production_index, 1),
        "productionBonus": production_bonus,
        "notesWithin20CentsPercent": notes_in_20,
        "flags": {
            "highPotentialLowProduction": tav >= 75 and production_index < 55,
            "processedVocals": production_index > 70,
            "compressedMaster": production_index > 82,
            "lowQualityAudio": production_index < 35,
            "lyricsUncertain": False,
            "insufficientEvidence": False,
        },
        "vocalProfile": {
            "lowestNote": "C3",
            "highestNote": "A4",
            "usableRangeSemitones": 21,
            "detectedKey": "C Major",
            "processingLevel": round(_clamp(production_index / 120.0, 0, 1), 2),
            "processedVocals": production_index > 70,
            "intrinsicPitchConfidence": round(_clamp(0.72 + (pillar_v - 0.7) * 0.6, 0.4, 0.99), 2),
        },
        "evidence": [
            f"Pitch stability proxy: {notes_in_20}% frames within +/-20 cents",
            f"Production index: {round(production_index,1)}/100 with capped bonus {production_bonus}",
        ],
    }


def compute_artist_rollup(tracks: List[Dict[str, Any]]) -> Dict[str, Any]:
    tavs = sorted([float(t.get("tav", 75)) for t in tracks]) or [75.0]
    n = len(tavs)
    if n % 2 == 0:
        median = (tavs[n // 2 - 1] + tavs[n // 2]) / 2.0
    else:
        median = tavs[n // 2]
    p75 = tavs[min(n - 1, int(0.75 * n))]
    mean = sum(tavs) / n
    var = sum((x - mean) ** 2 for x in tavs) / n
    std = math.sqrt(var)
    consistency = round(max(0.0, 100.0 - 2.0 * std), 1)
    # simple trajectory: compare first/last in provided order
    if len(tracks) >= 2:
        slope = (float(tracks[0].get("tav", median)) - float(tracks[-1].get("tav", median))) / max(1, len(tracks) - 1)
    else:
        slope = 0.0
    trajectory = round(_clamp(50.0 + 10.0 * slope, 0.0, 100.0), 1)
    aav = round(0.50 * median + 0.20 * p75 + 0.15 * consistency + 0.15 * trajectory, 1)
    high_potential = sum(1 for t in tracks if t.get("flags", {}).get("highPotentialLowProduction"))
    return {
        "aav": aav,
        "medianTAV": round(median, 1),
        "p75TAV": round(p75, 1),
        "consistency": consistency,
        "trajectory": trajectory,
        "trackCount": n,
        "highPotentialCount": high_potential,
    }


SEED_ARTISTS = [
    {
        "name": "Kinoti",
        "city": "Nairobi",
        "country": "Kenya",
        "primaryGenre": "Afro-Soul / R&B",
        "genres": ["Afro-Soul / R&B", "East African Indie", "Emerging"],
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        "summary": "Nairobi indie R&B singer-songwriter blending Swahili balladry and acoustic soul textures.",
        "monthlyListeners": 64200,
        "growthSignal7d": 28.4,
        "growthSignal30d": 74.2,
        "tracks": [
            {"id": 1729104821, "title": "Nitangoja", "collectionName": "Nitangoja - Single", "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/a7/9d/b1/a79db1c5-bf6e-9ca2-4877-3e1f744c683b/mzaf_11171804245645511082.plus.aac.p.m4a", "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a7/9d/b1/a79db1c5-bf6e-9ca2-4877-3e1f744c683b/artwork.jpg/600x600bb.jpg", "releaseDate": "2023-11-17", "primaryGenreName": "Afro-Soul", "trackViewUrl": "https://music.apple.com/"},
            {"id": 1698293012, "title": "Feel The Love", "collectionName": "Boy Lover - EP", "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/64/09/b3/6409b307-5e60-466c-5912-70b778262f22/mzaf_10336044702951759714.plus.aac.p.m4a", "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/64/09/b3/6409b307-5e60-466c-5912-70b778262f22/artwork.jpg/600x600bb.jpg", "releaseDate": "2023-07-21", "primaryGenreName": "R&B / Soul", "trackViewUrl": "https://music.apple.com/"},
        ],
    },
    {
        "name": "Ethan Muziki",
        "city": "Nairobi",
        "country": "Kenya",
        "primaryGenre": "Afro-Fusion / Pop",
        "genres": ["Afro-Fusion / Pop", "East African Indie", "Emerging"],
        "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        "summary": "Kenyan vocalist blending Kikuyu textures with contemporary Afro-fusion harmonies.",
        "monthlyListeners": 88500,
        "growthSignal7d": 32.1,
        "growthSignal30d": 82.6,
        "tracks": [
            {"id": 1714829103, "title": "Jioni", "collectionName": "Jioni - Single", "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/b8/1d/18/b81d1847-a36c-dfc5-28b9-e1379f536c92/mzaf_15967086884606132007.plus.aac.p.m4a", "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/b8/1d/18/b81d1847-a36c-dfc5-28b9-e1379f536c92/artwork.jpg/600x600bb.jpg", "releaseDate": "2023-11-03", "primaryGenreName": "Afro-Fusion", "trackViewUrl": "https://music.apple.com/"},
            {"id": 1690184912, "title": "WANAKAZANA", "collectionName": "WANAKAZANA - Single", "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/28/ff/15/28ff15ea-f2cb-3b2d-1ea3-90d56eecc868/mzaf_17208182245347310537.plus.aac.p.m4a", "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/28/ff/15/28ff15ea-f2cb-3b2d-1ea3-90d56eecc868/artwork.jpg/600x600bb.jpg", "releaseDate": "2023-06-02", "primaryGenreName": "Afrobeats", "trackViewUrl": "https://music.apple.com/"},
        ],
    },
    {
        "name": "Watendawili",
        "city": "Nairobi",
        "country": "Kenya",
        "primaryGenre": "Afro-Acoustic / Benga",
        "genres": ["Afro-Acoustic / Benga", "East African Indie", "Emerging"],
        "avatarUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
        "summary": "Kenyan vocal duo reinterpreting Benga and Taarab with acoustic harmonies.",
        "monthlyListeners": 42000,
        "growthSignal7d": 19.5,
        "growthSignal30d": 52.0,
        "tracks": [
            {"id": 1718291044, "title": "Cham Thum (Atoti)", "collectionName": "Double Treble - Single", "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/18/43/d8/1843d838-8fa1-628f-7f72-749e79435b6f/mzaf_11942186591702872332.plus.aac.p.m4a", "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/18/43/d8/1843d838-8fa1-628f-7f72-749e79435b6f/artwork.jpg/600x600bb.jpg", "releaseDate": "2023-11-24", "primaryGenreName": "Benga Fusion", "trackViewUrl": "https://music.apple.com/"},
        ],
    },
]


def build_artist_record(cfg: Dict[str, Any], idx: int) -> Dict[str, Any]:
    tracks = []
    for t in cfg.get("tracks", []):
        avm = compute_track_avm(t["id"], t["title"], t.get("primaryGenreName", cfg.get("primaryGenre", "General")), t["id"])
        tracks.append({
            **t,
            "artistName": cfg["name"],
            "artistId": 1000 + idx,
            "avm": avm,
        })
    rollup = compute_artist_rollup(tracks)
    discovery = round(84.0 + idx * 2.1 + min(6, len(tracks) * 1.5), 1)
    confidence = 92
    combined = round(rollup["aav"] * 0.6 + discovery * 0.4, 1)
    if combined >= 90:
        tier = "PURSUE"
    elif combined >= 82:
        tier = "MEET"
    elif combined >= 72:
        tier = "WATCH"
    else:
        tier = "MORE_EVIDENCE"
    now = datetime.now(timezone.utc).isoformat()
    positives = [
        f"AVM AAV Rating: {rollup['aav']}/100 across {len(tracks)} releases",
        f"Catalog consistency: {rollup['consistency']}/100",
        f"30-day growth signal: +{cfg.get('growthSignal30d', 40)}%",
    ]
    if rollup.get("highPotentialCount", 0) > 0:
        positives.insert(0, "HIGH POTENTIAL, LOW PRODUCTION: raw upside exceeds polish")
    return {
        "id": f"art-{cfg['name'].lower().replace(' ', '-')}",
        "name": cfg["name"],
        "primaryGenre": cfg["primaryGenre"],
        "genres": cfg.get("genres", [cfg["primaryGenre"]]),
        "country": cfg["country"],
        "city": cfg["city"],
        "avatarUrl": cfg["avatarUrl"],
        "summary": cfg["summary"],
        "verified": True,
        "discoveryScore": discovery,
        "confidenceScore": confidence,
        "artisticScore": round(rollup["aav"] / 20.0, 1),
        "combinedScore": combined,
        "recommendationTier": tier,
        "stage": "Emerging",
        "monthlyListeners": cfg.get("monthlyListeners", 50000),
        "growthSignal7d": cfg.get("growthSignal7d", 20.0),
        "growthSignal30d": cfg.get("growthSignal30d", 50.0),
        "organicConfidence": 94,
        "firstDiscoveredAt": "2026-10-01T00:00:00Z",
        "lastObservedAt": now,
        "tracks": tracks,
        "avmRollup": rollup,
        "positiveSignals": positives,
        "unresolvedRisks": [
            "Independent distribution verification ongoing",
            "International showcase representation in early planning",
        ],
        "nextBestAction": "Priority A&R contact" if rollup.get("highPotentialCount", 0) > 0 else "Schedule listening session with team.",
    }


def get_seed_artists() -> List[Dict[str, Any]]:
    return [build_artist_record(cfg, i) for i, cfg in enumerate(SEED_ARTISTS)]


def generate_timeseries(base_monthly: int, horizon: str = "90D") -> List[Dict[str, Any]]:
    days = {"7D": 7, "30D": 30, "90D": 90, "180D": 180, "1Y": 365}.get(horizon, 90)
    now = datetime.now(timezone.utc)
    points = []
    for i in range(days - 1, -1, -1):
        dt = now - timedelta(days=i)
        progress = 1.0 - (i / max(1, days))
        noise = math.sin(i * 0.45) * 0.12
        spotify = int(base_monthly * (0.35 + progress * 0.65 + noise) * 0.45)
        apple = int(spotify * 0.28 * (1 + noise * 0.5))
        youtube = int(spotify * 0.55 * (1 - noise * 0.3))
        tiktok = int(spotify * 0.75 * (progress ** 1.4))
        total = spotify + apple + youtube + tiktok
        points.append({
            "date": dt.strftime("%b %d"),
            "timestamp": int(dt.timestamp() * 1000),
            "spotify": max(0, spotify),
            "appleMusic": max(0, apple),
            "youtube": max(0, youtube),
            "tiktokUgc": max(0, tiktok),
            "total": max(0, total),
        })
    return points
