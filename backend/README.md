# Breakout Radar Python Backend

Lightweight, dependency-free Python backend for Breakout Radar.

## Features
- `GET /api/health` - service health
- `GET /api/artists/seed` - curated emerging-artist seed dataset
- `GET /api/artists` - persisted artist catalog (SQLite-backed)
- `POST /api/artists` - upsert discovered artists
- `GET /api/discovery/search?q=...` - live iTunes-backed discovery + AVM scoring + persistence
- `POST /api/avm/track` - compute track AVM
- `POST /api/avm/artist` - compute artist rollup
- `GET /api/analytics/timeseries?baseMonthly=64000&horizon=90D` - telemetry series for dashboards
- `GET/POST /api/decisions` - A&R decision ledger
- `GET/POST /api/settings` - workspace settings
- `GET/POST /api/scans` - scan history

## Run
```bash
cd backend
python3 server.py
```
Default: `http://0.0.0.0:8000`

Environment variables:
- `HOST` (default `0.0.0.0`)
- `PORT` (default `8000`)
- `BREAKOUT_RADAR_DB` (SQLite path, default `backend/breakout_radar.db`)

## Notes
- Uses Python standard library only.
- Persists data to SQLite for local/dev durability.
- Designed to integrate with the Vite frontend via `/api` proxy or `VITE_API_BASE_URL`.
