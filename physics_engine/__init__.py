"""AnoHUB Physics & Telemetry Engine - package init

Expose core helpers for ingestion and physics calculations.
"""
from .ingest import TelemetryIngestor
from .joukowsky import joukowsky_delta_p
from .cavitation import detect_cavitation_simple, detect_cavitation_from_timeseries
from .risk48 import compute_48_percent_dynamic_risk
from .models import TelemetryRecord, TurbineSpec

__all__ = [
    "TelemetryIngestor",
    "joukowsky_delta_p",
    "detect_cavitation_simple",
    "detect_cavitation_from_timeseries",
    "compute_48_percent_dynamic_risk",
    "TelemetryRecord",
    "TurbineSpec",
]
