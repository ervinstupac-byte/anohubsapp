"""Utility helpers for physics engine."""
from typing import Iterable


def safe_mean(seq: Iterable[float]) -> float:
    vals = [float(x) for x in seq if x is not None]
    if not vals:
        return 0.0
    return sum(vals) / len(vals)
