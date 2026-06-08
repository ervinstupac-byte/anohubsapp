"""Pydantic schemas for API ingestion and validation."""
from pydantic import BaseModel, Field, root_validator
from typing import List, Optional
from datetime import datetime


class NozzleStateSchema(BaseModel):
    nozzle_index: int = Field(..., ge=1, le=24)
    # Support either percent (preferred) or mm travel. Enforce realistic bounds.
    needle_position_pct: Optional[float] = Field(None, ge=0.0, le=100.0)
    needle_position_mm: Optional[float] = Field(None, ge=0.0, le=200.0)
    deflector_open: Optional[bool]
    deflector_gap_mm: Optional[float] = Field(None, ge=0.0, le=50.0)


class GeneratorCoolingSchema(BaseModel):
    bearing_temp_c: Optional[float] = Field(None, ge=-20.0, le=250.0)
    coolant_flow_lps: Optional[float] = Field(None, ge=0.0, le=500.0)
    bearing_cooling_present: Optional[bool] = None


class PeltonTelemetrySchema(BaseModel):
    timestamp: datetime
    turbine_id: str
    pressure_pa: Optional[float] = Field(None, ge=0.0)
    flow_m3s: Optional[float] = Field(None, ge=0.0, le=200.0)
    head_m: Optional[float] = Field(None, ge=0.0, le=2000.0)
    rotor_speed_rpm: Optional[float] = Field(None, ge=0.0, le=20000.0)
    vibration_g: Optional[float] = Field(None, ge=0.0, le=50.0)
    operating_efficiency: Optional[float] = Field(None, ge=0.0, le=1.0)
    nozzle_states: Optional[List[NozzleStateSchema]]
    generator_cooling: Optional[GeneratorCoolingSchema]
    delta_v_m_s: Optional[float] = Field(None, ge=-100.0, le=100.0)
    pressure_timeseries: Optional[List[float]] = None

    @root_validator
    def check_generator_cooling_consistency(cls, values):
        gc = values.get('generator_cooling')
        if gc and gc.bearing_cooling_present:
            # if cooling is present, flow should be non-zero
            if gc.coolant_flow_lps is None or gc.coolant_flow_lps <= 0:
                raise ValueError('bearing_cooling_present is true but coolant_flow_lps is missing or zero')
        if values.get('operating_efficiency') is not None:
            eff = values.get('operating_efficiency')
            if eff < 0 or eff > 1:
                raise ValueError('operating_efficiency must be between 0.0 and 1.0')
        return values
