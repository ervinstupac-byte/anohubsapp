"""Implementation of configurable '48% dynamic risk' scoring model.

This model is intentionally parameterized and requires calibration for the
target 10MW plant. It combines operating efficiency deviation, transient
pressure events (Joukowsky), and cavitation indicators into a single
0..1 risk score.
"""
from typing import Optional
import math


def compute_48_percent_dynamic_risk(
    operating_efficiency: Optional[float],
    reference_efficiency: float = 0.48,
    delta_p_pa: Optional[float] = None,
    p_ref_pa: float = 1e5,
    cavitation_flag: bool = False,
    weights: dict = None,
) -> float:
    """Compute a 0..1 risk score combining multiple signals.

    - operating_efficiency: current measured efficiency (0..1) or None
    - reference_efficiency: the 48% baseline used for the original theory
    - delta_p_pa: magnitude of recent Joukowsky pressure transient (Pa)
    - p_ref_pa: normalization reference pressure
    - cavitation_flag: boolean indicator
    - weights: dict with weight keys: eff, dp, cav

    Returns risk score clipped to [0,1]. Calibrate `weights` for the plant.
    """
    if weights is None:
        weights = {"eff": 0.5, "dp": 0.3, "cav": 0.2}

    eff_contrib = 0.0
    if operating_efficiency is not None:
        # penalty proportional to squared deviation from reference
        eff_contrib = (max(0.0, reference_efficiency - operating_efficiency) / max(1e-6, reference_efficiency)) ** 2

    dp_contrib = 0.0
    if delta_p_pa is not None:
        dp_contrib = min(1.0, abs(delta_p_pa) / float(p_ref_pa))

    cav_contrib = 1.0 if cavitation_flag else 0.0

    raw = weights.get("eff", 0.5) * eff_contrib + weights.get("dp", 0.3) * dp_contrib + weights.get("cav", 0.2) * cav_contrib
    return float(max(0.0, min(1.0, raw)))
