"""Lightweight SQLite persistence for alerts."""
import sqlite3
import json
import time
from pathlib import Path
from typing import Any, Dict, List, Optional


def init_db(db_path: str):
    p = Path(db_path)
    if not p.parent.exists():
        p.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute(
        """
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        turbine_id TEXT,
        severity TEXT,
        issue TEXT,
        action TEXT,
        risk_score REAL,
        payload_json TEXT,
        created_at REAL
    )
    """
    )
    conn.commit()
    conn.close()


def insert_alert(db_path: str, timestamp: str, turbine_id: str, severity: str, issue: str, action: str, risk_score: float, payload: Dict[str, Any]):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute(
        "INSERT INTO alerts (timestamp, turbine_id, severity, issue, action, risk_score, payload_json, created_at) VALUES (?,?,?,?,?,?,?,?)",
        (timestamp, turbine_id, severity, issue, action, risk_score, json.dumps(payload, default=str), time.time()),
    )
    conn.commit()
    conn.close()


def get_recent_alerts(db_path: str, limit: int = 20) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM alerts ORDER BY id DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]
