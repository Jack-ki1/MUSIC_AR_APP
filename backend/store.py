from __future__ import annotations

import json
import os
import sqlite3
import threading
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("BREAKOUT_RADAR_DB", os.path.join(_BASE_DIR, "breakout_radar.db"))
_lock = threading.Lock()


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with _lock:
        conn = _conn()
        try:
            cur = conn.cursor()
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS artists (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    payload TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS decisions (
                    id TEXT PRIMARY KEY,
                    artist_id TEXT,
                    payload TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS scans (
                    id TEXT PRIMARY KEY,
                    payload TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS settings (
                    id TEXT PRIMARY KEY,
                    payload TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS provider_configs (
                    provider_id TEXT PRIMARY KEY,
                    enabled INTEGER NOT NULL DEFAULT 0,
                    credentials TEXT NOT NULL DEFAULT '{}',
                    updated_at TEXT NOT NULL
                )
                """
            )
            conn.commit()
        finally:
            conn.close()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def upsert_artist(artist: Dict[str, Any]) -> None:
    artist_id = str(artist.get("id") or "")
    if not artist_id:
        return
    payload = json.dumps(artist, ensure_ascii=False)
    with _lock:
        conn = _conn()
        try:
            conn.execute(
                "INSERT INTO artists(id, name, payload, updated_at) VALUES(?,?,?,?) "
                "ON CONFLICT(id) DO UPDATE SET name=excluded.name, payload=excluded.payload, updated_at=excluded.updated_at",
                (artist_id, artist.get("name", ""), payload, _now()),
            )
            conn.commit()
        finally:
            conn.close()


def list_artists() -> List[Dict[str, Any]]:
    with _lock:
        conn = _conn()
        try:
            rows = conn.execute("SELECT payload FROM artists ORDER BY updated_at DESC").fetchall()
            return [json.loads(r["payload"]) for r in rows]
        finally:
            conn.close()


def save_decision(decision: Dict[str, Any]) -> None:
    dec_id = str(decision.get("id") or "")
    if not dec_id:
        return
    payload = json.dumps(decision, ensure_ascii=False)
    created = decision.get("createdAt") or _now()
    with _lock:
        conn = _conn()
        try:
            conn.execute(
                "INSERT OR REPLACE INTO decisions(id, artist_id, payload, created_at) VALUES(?,?,?,?)",
                (dec_id, str(decision.get("artistId", "")), payload, created),
            )
            conn.commit()
        finally:
            conn.close()


def list_decisions(limit: int = 100) -> List[Dict[str, Any]]:
    with _lock:
        conn = _conn()
        try:
            rows = conn.execute(
                "SELECT payload FROM decisions ORDER BY created_at DESC LIMIT ?",
                (int(limit),),
            ).fetchall()
            return [json.loads(r["payload"]) for r in rows]
        finally:
            conn.close()


def save_scan(scan: Dict[str, Any]) -> None:
    scan_id = str(scan.get("id") or f"scan-{int(datetime.now().timestamp()*1000)}")
    payload = json.dumps(scan, ensure_ascii=False)
    with _lock:
        conn = _conn()
        try:
            conn.execute(
                "INSERT OR REPLACE INTO scans(id, payload, created_at) VALUES(?,?,?)",
                (scan_id, payload, scan.get("timestamp") or _now()),
            )
            conn.commit()
        finally:
            conn.close()


def list_scans(limit: int = 50) -> List[Dict[str, Any]]:
    with _lock:
        conn = _conn()
        try:
            rows = conn.execute(
                "SELECT payload FROM scans ORDER BY created_at DESC LIMIT ?",
                (int(limit),),
            ).fetchall()
            return [json.loads(r["payload"]) for r in rows]
        finally:
            conn.close()


def save_settings(settings: Dict[str, Any], settings_id: str = "workspace_default") -> None:
    payload = json.dumps(settings, ensure_ascii=False)
    with _lock:
        conn = _conn()
        try:
            conn.execute(
                "INSERT INTO settings(id, payload, updated_at) VALUES(?,?,?) "
                "ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at",
                (settings_id, payload, _now()),
            )
            conn.commit()
        finally:
            conn.close()


def get_settings(settings_id: str = "workspace_default") -> Optional[Dict[str, Any]]:
    with _lock:
        conn = _conn()
        try:
            row = conn.execute("SELECT payload FROM settings WHERE id=?", (settings_id,)).fetchone()
            return json.loads(row["payload"]) if row else None
        finally:
            conn.close()


def save_provider_config(provider_id: str, enabled: bool, credentials: Optional[Dict[str, Any]] = None) -> None:
    pid = str(provider_id or "").strip()
    if not pid:
        return
    creds_json = json.dumps(credentials or {}, ensure_ascii=False)
    with _lock:
        conn = _conn()
        try:
            conn.execute(
                "INSERT INTO provider_configs(provider_id, enabled, credentials, updated_at) VALUES(?,?,?,?) "
                "ON CONFLICT(provider_id) DO UPDATE SET enabled=excluded.enabled, credentials=excluded.credentials, updated_at=excluded.updated_at",
                (pid, 1 if enabled else 0, creds_json, _now()),
            )
            conn.commit()
        finally:
            conn.close()


def save_provider_configs_bulk(configs: List[Dict[str, Any]]) -> None:
    for c in configs or []:
        save_provider_config(c.get("id") or c.get("provider_id"), bool(c.get("enabled")), c.get("credentials") or {})


def list_provider_configs() -> Dict[str, Dict[str, Any]]:
    with _lock:
        conn = _conn()
        try:
            rows = conn.execute("SELECT provider_id, enabled, credentials, updated_at FROM provider_configs").fetchall()
            out: Dict[str, Dict[str, Any]] = {}
            for r in rows:
                try:
                    creds = json.loads(r["credentials"] or "{}")
                except Exception:
                    creds = {}
                out[r["provider_id"]] = {"enabled": bool(r["enabled"]), "credentials": creds, "updated_at": r["updated_at"]}
            return out
        finally:
            conn.close()


def get_provider_config(provider_id: str) -> Dict[str, Any]:
    pid = str(provider_id or "").strip()
    with _lock:
        conn = _conn()
        try:
            row = conn.execute("SELECT provider_id, enabled, credentials, updated_at FROM provider_configs WHERE provider_id=?", (pid,)).fetchone()
            if not row:
                return {"enabled": False, "credentials": {}}
            try:
                creds = json.loads(row["credentials"] or "{}")
            except Exception:
                creds = {}
            return {"enabled": bool(row["enabled"]), "credentials": creds, "updated_at": row["updated_at"]}
        finally:
            conn.close()
