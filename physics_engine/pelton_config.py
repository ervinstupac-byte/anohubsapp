"""Baseline calibration defaults for 10MW vertical Pelton (PoC).

These are conservative, site-calibratable defaults for a high-head Pelton
with 6 nozzles. Adjust after ingesting real SCADA data.
"""
NUM_NOZZLES = 6
VAPOR_PRESSURE_PA = 2338.0  # ~20 C saturation vapor pressure (Pa)
CAVITATION_MARGIN_PA = 5000.0
HF_BAND = (500.0, 5000.0)  # Hz band for HF cavitation detection
HF_ENERGY_THRESHOLD = 1e-4
P_REF_PA = 5e6  # normalization reference pressure (5 MPa)
RISK_WEIGHTS = {"eff": 0.45, "dp": 0.4, "cav": 0.15}
BEARING_TEMP_THRESHOLD_C = 80.0
