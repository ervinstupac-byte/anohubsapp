"""Telemetry ingestion interface for noisy SCADA streams.

Responsibilities:
- Validate and normalize incoming records
- Handle timestamp parsing and basic smoothing
- Emit `TelemetryRecord` instances for downstream processing
"""
from datetime import datetime
from typing import Any, Dict, Optional
import math

from .models import TelemetryRecord


class TelemetryIngestor:
    def __init__(self, smoothing_alpha: Optional[float] = None):
        """smoothing_alpha: None => disabled, otherwise simple EMA 0..1"""
        self.smoothing_alpha = smoothing_alpha
        self._last = {}

    def _parse_ts(self, ts: Any) -> datetime:
        if isinstance(ts, datetime):
            return ts
        # Accept epoch (s or ms) or ISO strings
        if isinstance(ts, (int, float)):
            # guess seconds vs ms
            if ts > 1e12:
                # microseconds/malformed: treat as ms
                return datetime.fromtimestamp(ts / 1000.0)
            if ts > 1e10:
                return datetime.fromtimestamp(ts / 1000.0)
            return datetime.fromtimestamp(ts)
        if isinstance(ts, str):
            try:
                return datetime.fromisoformat(ts)
            except Exception:
                # fallback to float
                try:
                    f = float(ts)
                    return datetime.fromtimestamp(f)
                except Exception:
                    raise
        raise ValueError("Unsupported timestamp type")

    def _clean_value(self, key: str, value: Any) -> Optional[float]:
        if value is None:
            return None
        try:
            v = float(value)
        except Exception:
            return None
        if math.isfinite(v):
            return v
        return None

    def _ema(self, key: str, value: Optional[float]) -> Optional[float]:
        if self.smoothing_alpha is None or value is None:
            return value
        last = self._last.get(key)
        if last is None:
            self._last[key] = value
            return value
        out = self.smoothing_alpha * value + (1.0 - self.smoothing_alpha) * last
        self._last[key] = out
        return out

    def ingest(self, raw: Dict[str, Any]) -> TelemetryRecord:
        ts = self._parse_ts(raw.get("timestamp") or raw.get("time") or raw.get("ts"))
        tr = TelemetryRecord(
            timestamp=ts,
            turbine_id=str(raw.get("turbine_id") or raw.get("turbine") or "unknown"),
            pressure_pa=self._ema("pressure_pa", self._clean_value("pressure_pa", raw.get("pressure_pa") or raw.get("pressure"))),
            flow_m3s=self._ema("flow_m3s", self._clean_value("flow_m3s", raw.get("flow_m3s") or raw.get("flow"))),
            head_m=self._ema("head_m", self._clean_value("head_m", raw.get("head_m") or raw.get("head"))),
            rotor_speed_rpm=self._ema("rotor_speed_rpm", self._clean_value("rotor_speed_rpm", raw.get("rotor_speed_rpm") or raw.get("rpm"))),
            vibration_g=self._ema("vibration_g", self._clean_value("vibration_g", raw.get("vibration_g") or raw.get("vib"))),
            extra={k: v for k, v in raw.items() if k not in {"timestamp", "time", "ts", "turbine_id", "turbine", "pressure_pa", "pressure", "flow_m3s", "flow", "head_m", "head", "rotor_speed_rpm", "rpm", "vibration_g", "vib"}},
        )
        return tr
