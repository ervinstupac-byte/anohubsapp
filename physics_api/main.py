"""FastAPI app exposing Pelton telemetry ingestion and actionable alerts."""
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from physics_engine.ingest import TelemetryIngestor
from physics_engine.cavitation import detect_cavitation_simple, detect_cavitation_from_timeseries
from physics_engine.risk48 import compute_48_percent_dynamic_risk
from physics_engine.schemas import PeltonTelemetrySchema
from physics_engine.pelton_config import (
    VAPOR_PRESSURE_PA,
    CAVITATION_MARGIN_PA,
    HF_BAND,
    HF_ENERGY_THRESHOLD,
    P_REF_PA,
    RISK_WEIGHTS,
    BEARING_TEMP_THRESHOLD_C,
)
from pathlib import Path
from physics_engine import pelton_config
from physics_engine import storage
import json

app = FastAPI(title="AnoHUB Pelton Telemetry API")
ingestor = TelemetryIngestor(smoothing_alpha=0.2)

# Initialize SQLite DB
BASE_DIR = Path(__file__).resolve().parents[1]
DB_PATH = str(BASE_DIR / "anohubsapp_alerts.db")
storage.init_db(DB_PATH)


def _severity_level_for_conditions(cav_flag: bool, delta_p: float, bearing_temp: float, efficiency_dev: float):
    """Decide severity level: INFO, WARNING, CRITICAL"""
    if cav_flag and delta_p is not None and abs(delta_p) >= 0.2 * P_REF_PA:
        return "CRITICAL"
    if bearing_temp is not None and bearing_temp >= BEARING_TEMP_THRESHOLD_C + 10.0:
        return "CRITICAL"
    # WARNING conditions
    if cav_flag or (bearing_temp is not None and bearing_temp >= BEARING_TEMP_THRESHOLD_C) or (efficiency_dev is not None and efficiency_dev >= 0.05):
        return "WARNING"
    return "INFO"


@app.post("/pelton/telemetry")
def pelton_telemetry(payload: PeltonTelemetrySchema):
    tr = ingestor.ingest(payload.dict())

    # Cavitation checks
    cav_simple = False
    cav_hf = False
    if tr.pressure_pa is not None:
        cav_simple = detect_cavitation_simple(tr.pressure_pa, VAPOR_PRESSURE_PA, margin_pa=CAVITATION_MARGIN_PA)
    if payload.pressure_timeseries:
        cav_hf = detect_cavitation_from_timeseries(payload.pressure_timeseries, fs=1000.0, hf_band=HF_BAND, hf_energy_threshold=HF_ENERGY_THRESHOLD)

    cav_flag = cav_simple or cav_hf

    # Delta p from provided delta_v if supplied
    delta_p = None
    if payload.delta_v_m_s is not None:
        from physics_engine.joukowsky import joukowsky_delta_p

        delta_p = joukowsky_delta_p(payload.delta_v_m_s)

    # Compute risk score
    score = compute_48_percent_dynamic_risk(
        operating_efficiency=payload.operating_efficiency,
        reference_efficiency=0.48,
        delta_p_pa=delta_p,
        p_ref_pa=P_REF_PA,
        cavitation_flag=cav_flag,
        weights=RISK_WEIGHTS,
    )

    alerts = []

    # Heuristic to identify a likely nozzle culprit (difference from mean needle position)
    culprit_nozzle = None
    if payload.nozzle_states:
        # Prefer percent-based needle position when available; fall back to mm->percent conversion assuming reasonable travel
        positions = []
        for n in payload.nozzle_states:
            pct = None
            if getattr(n, 'needle_position_pct', None) is not None:
                pct = n.needle_position_pct
            elif getattr(n, 'needle_position_mm', None) is not None:
                # assume full travel ~10 mm if not provided; clamp
                pct = min(100.0, max(0.0, (n.needle_position_mm / 10.0) * 100.0))
            if pct is not None:
                positions.append(pct)
        if positions:
            mean_pos = sum(positions) / len(positions)
            diffs = []
            for n in payload.nozzle_states:
                pct = None
                if getattr(n, 'needle_position_pct', None) is not None:
                    pct = n.needle_position_pct
                elif getattr(n, 'needle_position_mm', None) is not None:
                    pct = min(100.0, max(0.0, (n.needle_position_mm / 10.0) * 100.0))
                if pct is None:
                    continue
                diffs.append((n.nozzle_index, abs(pct - mean_pos)))
            if diffs:
                culprit_nozzle = max(diffs, key=lambda x: x[1])[0]

    # Efficiency deviation
    eff_dev = None
    if payload.operating_efficiency is not None:
        eff_dev = max(0.0, 0.48 - payload.operating_efficiency)

    # Cavitation alert
    if cav_flag:
        issue = f"Suspected cavitation on Nozzle #{culprit_nozzle}" if culprit_nozzle else "Suspected cavitation"
        action = "Inspect deflector and needle stroke synchronization for debris or wear; collect pressure timeseries around event; reduce load if safe."
        severity = _severity_level_for_conditions(cav_flag, delta_p if delta_p is not None else 0.0, payload.generator_cooling.bearing_temp_c if payload.generator_cooling else None, eff_dev)
        alerts.append({"severity": severity, "issue": issue, "action": action})

    # Bearing temperature alert
    if payload.generator_cooling and payload.generator_cooling.bearing_temp_c is not None:
        bt = payload.generator_cooling.bearing_temp_c
        if bt >= BEARING_TEMP_THRESHOLD_C:
            issue = "Generator bearing temperature above nominal threshold"
            action = "Verify active cooling loop, coolant flow rate, and cooling pump status; consider load reduction and schedule bearing inspection."
            severity = _severity_level_for_conditions(False, delta_p if delta_p is not None else 0.0, bt, eff_dev)
            alerts.append({"severity": severity, "issue": issue, "action": action})

    # Nozzle mechanical checks
    if payload.nozzle_states:
        for n in payload.nozzle_states:
            if n.needle_position_mm is not None and n.needle_position_mm < 1.0:
                issue = f"Nozzle {n.nozzle_index}: needle nearly closed"
                action = "Check needle actuator and linkage for blockage or loss of travel; balance nozzle openings."
                severity = "WARNING"
                alerts.append({"severity": severity, "issue": issue, "action": action})

    # Efficiency deviation alert
    if eff_dev is not None and eff_dev >= 0.05:
        sev = "CRITICAL" if eff_dev >= 0.1 else "WARNING"
        issue = f"Operating efficiency below reference by {eff_dev:.2%}"
        action = "Review nozzle alignment, water supply and generator coupling; schedule tuning run."
        alerts.append({"severity": sev, "issue": issue, "action": action})

    # Persist WARNING/CRITICAL alerts
    payload_dict = payload.dict()
    for a in alerts:
        if a["severity"] in ("WARNING", "CRITICAL"):
            storage.insert_alert(DB_PATH, payload.timestamp.isoformat(), payload.turbine_id, a["severity"], a["issue"], a["action"], float(score), payload_dict)

    return JSONResponse({"risk_score": score, "alerts": alerts})


@app.get("/alerts/recent")
def alerts_recent(limit: int = 20):
    """Return recent persisted alerts formatted for frontend consumption.

    The frontend expects severity labels and plain-English messages; this
    endpoint returns fields compatible with `HealthAlert` and the
    `NotificationItem` used in the app's contexts.
    """
    rows = storage.get_recent_alerts(DB_PATH, limit=limit)
    out = []
    for r in rows:
        # payload_json stored as string
        try:
            payload = json.loads(r.get('payload_json') or '{}')
        except Exception:
            payload = {}

        # Map severity to UI severity (low/medium/high)
        sev = r.get('severity')
        if sev == 'CRITICAL':
            ui_sev = 'high'
        elif sev == 'WARNING':
            ui_sev = 'medium'
        else:
            ui_sev = 'low'

        alert_obj = {
            'id': r.get('id'),
            'severity': sev,  # CRITICAL | WARNING | INFO
            'uiSeverity': ui_sev,  # low | medium | high (for legacy components)
            'issue': r.get('issue'),
            'message': r.get('issue'),
            'action': r.get('action'),
            'turbineId': r.get('turbine_id'),
            'timestamp': r.get('timestamp'),
            'riskScore': r.get('risk_score'),
            'payload': payload,
            # HealthAlert-compatible fields
            'parameter': None,
            'currentValue': None,
            'threshold': None,
            'recommendation': r.get('action')
        }
        out.append(alert_obj)

    return JSONResponse({"alerts": out})
