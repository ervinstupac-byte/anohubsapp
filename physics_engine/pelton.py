"""Pelton-specific turbine schema and helpers."""
from dataclasses import dataclass, field
from typing import List, Optional
from .models import TurbineSpec, TurbineType


@dataclass
class NozzleState:
    nozzle_index: int
    needle_position_mm: Optional[float] = None
    deflector_open: Optional[bool] = None


@dataclass
class GeneratorCooling:
    bearing_temp_c: Optional[float] = None
    coolant_flow_lps: Optional[float] = None


@dataclass
class PeltonSpec(TurbineSpec):
    num_nozzles: int = 6
    nozzles: List[NozzleState] = field(default_factory=list)
    generator_cooling: Optional[GeneratorCooling] = None


def build_pelton_spec(turbine_id: str, rated_power_kw: float, nozzles: int = 6) -> PeltonSpec:
    return PeltonSpec(
        turbine_id=turbine_id,
        turbine_type=TurbineType.PELTON,
        rated_power_kw=rated_power_kw,
        runner_diameter_m=None,
        draft_tube_height_m=None,
        num_nozzles=nozzles,
        nozzles=[NozzleState(i + 1) for i in range(nozzles)],
        generator_cooling=GeneratorCooling(),
    )
