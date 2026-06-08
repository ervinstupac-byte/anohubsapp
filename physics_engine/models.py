"""Data models for telemetry and turbine specifications."""
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional


class TurbineType(str, Enum):
    FRANCIS = "francis"
    KAPLAN = "kaplan"
    PELTON = "pelton"


@dataclass
class TurbineSpec:
    turbine_id: str
    turbine_type: TurbineType
    rated_power_kw: float
    runner_diameter_m: Optional[float] = None
    draft_tube_height_m: Optional[float] = None


@dataclass
class TelemetryRecord:
    timestamp: datetime
    turbine_id: str
    pressure_pa: Optional[float] = None
    flow_m3s: Optional[float] = None
    head_m: Optional[float] = None
    rotor_speed_rpm: Optional[float] = None
    vibration_g: Optional[float] = None
    extra: dict = None
