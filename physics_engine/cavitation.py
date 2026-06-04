"""Cavitation detection helpers.

Simple, calibrated algorithms suitable for noisy SCADA inputs.
"""
from typing import Sequence, Tuple
import numpy as np


def detect_cavitation_simple(pressure_pa: float, vapor_pressure_pa: float, margin_pa: float = 5000.0) -> bool:
    """Flag cavitation when local static pressure approaches vapor pressure.

    margin_pa: a safety margin to account for measurement noise and dynamic effects.
    Returns True when cavitation risk is present.
    """
    if pressure_pa is None:
        return False
    return float(pressure_pa) <= float(vapor_pressure_pa) + float(margin_pa)


def detect_cavitation_from_timeseries(pressure_series: Sequence[float], fs: float, hf_band: Tuple[float, float] = (100.0, 2000.0), hf_energy_threshold: float = 1e-3) -> bool:
    """Detect cavitation-like signatures by high-frequency energy in pressure signal.

    - pressure_series: array-like pressure time series (Pa)
    - fs: sampling frequency (Hz)
    - hf_band: high-frequency band to inspect (Hz)
    - hf_energy_threshold: normalized energy threshold to flag

    Returns True if HF energy exceeds threshold.
    Note: requires calibration per site and sensor.
    """
    p = np.asarray(pressure_series)
    if p.size < 8:
        return False
    # Detrend and compute FFT
    p = p - np.mean(p)
    freqs = np.fft.rfftfreq(p.size, 1.0 / fs)
    spec = np.abs(np.fft.rfft(p)) ** 2
    # integrate energy in band
    band_mask = (freqs >= hf_band[0]) & (freqs <= hf_band[1])
    if not band_mask.any():
        return False
    hf_energy = spec[band_mask].sum()
    total_energy = spec.sum() + 1e-12
    ratio = hf_energy / total_energy
    return float(ratio) >= float(hf_energy_threshold)
