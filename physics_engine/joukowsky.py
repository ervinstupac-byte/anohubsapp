"""Joukowsky (water hammer) calculation helpers.

Δp = ρ * a * ΔV
Where:
 - ρ is fluid density (kg/m^3)
 - a is wave speed (m/s)
 - ΔV is change in fluid velocity (m/s)
"""
from typing import Union


def joukowsky_delta_p(delta_v: Union[float, int], rho: float = 1000.0, wave_speed: float = 1000.0) -> float:
    """Compute pressure rise/drop from a sudden velocity change.

    Parameters
    - delta_v: change in fluid velocity (m/s)
    - rho: fluid density (kg/m^3)
    - wave_speed: acoustic wave speed in the conduit (m/s)

    Returns pressure change in Pascals.
    """
    return float(rho) * float(wave_speed) * float(delta_v)
