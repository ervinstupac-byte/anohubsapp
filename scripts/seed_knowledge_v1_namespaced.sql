-- SQL Seed: expert_knowledge_base (namespaced symptom keys)
-- WARNING: Review before running in production. Generated from extracted_expert_knowledge_refined.json

BEGIN;

INSERT INTO public.expert_knowledge_base (symptom_key, diagnosis, recommended_action, severity)
VALUES
  ('FRANCIS_OBSERVATION_LOG_INDEX::LOG._COMPONENT_FRANCIS_OBSERVATION_LOG_ROLE_DESCRIBED_FOR_DI', '', '', 'MEDIUM'),
  ('FRANCIS_SYMPTOM_DICTIONARY_INDEX::DICTIONARY_|_ANOHUB_ENGINEERING_VAULT', '', '', 'MEDIUM'),
  ('FRANCIS_SYMPTOM_DICTIONARY_INDEX::DICTIONARY', '', '', 'MEDIUM'),
  ('FRANCIS_SYMPTOM_DICTIONARY_INDEX::DICTIONARY.', '', '', 'MEDIUM'),
  ('FRANCIS_SYMPTOM_DICTIONARY_INDEX::DICTIONARY._COMPONENT_FRANCIS_SYMPTOM_DICTIONARY_ROLE_DESCRIBED_FOR_DIAGNOSTIC_PRIORITIZATION.', '', '', 'MEDIUM'),
  ('FRANCIS_SYMPTOM_DICTIONARY_INDEX::CEREBRO_INGESTION_2026-01-17_18_35_02_SHA256_1D1578B19', 'Engineering Justification\n\nValidated engineering data for Francis Symptom Dictionary.\n\nNC-9.5 — AUXILIARY\nparam = 2.74\nAuxiliary param 2.74 used for diagnostics on francis symptom dictionary. Component francis symptom dictionary role described for diagnostic prioritization.\n\nAnalyzing specific cavitation risk (sigma=0.152) and torque (M=976745.145 N·m) for turbine_friend/francis_symptom_dictionary/index.html. — Calculated specifically for turbine_friend/francis_symptom_dictionary/index.html', '', 'MEDIUM'),
  ('FRANCIS_SYMPTOM_DICTIONARY_INDEX::DICTIONARY._COMPONENT_FRANCIS_SYMPTOM_DICTIONARY_ROLE_DESCRI', '', '', 'MEDIUM'),
  ('FRANCIS_SYMPTOM_DICTIONARY_INDEX_2::DICTIONARY._(INSTANCE_2)', '', '', 'MEDIUM'),
  ('FRANCIS_SYMPTOM_DICTIONARY_INDEX_3::DICTIONARY._(INSTANCE_3)', '', '', 'MEDIUM'),
  ('FRANCIS_H_FRANCIS_SYMPTOM_DICTIONARY_INDEX::CEREBRO_INGESTION_2026-01-17_18_35_02_SHA256_20B83DEE2', 'Engineering Justification\n\nValidated engineering data for Francis Symptom Dictionary.\n\nNC-9.5 — AUXILIARY\nparam = 8.615\nAuxiliary param 8.615 used for diagnostics on francis symptom dictionary. Component francis symptom dictionary role described for diagnostic prioritization.\n\nAnalyzing specific cavitation risk (sigma=0.098) and torque (M=409280.319 N·m) for turbine_friend/francis_h/francis_symptom_dictionary/index.html. — Calculated specifically for turbine_friend/francis_h/francis_symptom_dictionary/index.html', '', 'MEDIUM'),
  ('FRANCIS_EMERGENCY_PROTOCOLS::HUNTING', '', '', 'MEDIUM'),
  ('FRANCIS_EMERGENCY_PROTOCOLS::ERRATIC_GUIDE_VANE_MOVEMENT', '', '', 'MEDIUM'),
  ('FRANCIS_SOP_BEARINGS::MILKY', '', '', 'MEDIUM'),
  ('FRANCIS_SOP_COUPLING::AWARENESS', '', '', 'MEDIUM'),
  ('FRANCIS_SOP_GOVERNOR_PID::SPEED_OSCILLATES', 'Root Causes', '', 'MEDIUM'),
  ('FRANCIS_SOP_MIM::HIGH_SILT_CAN_CASCADE_THROUGH_4', '', '', 'MEDIUM'),
  ('FRANCIS_SOP_MIV_BYPASS::SCENARIO_BYPASS_VALVE_OPENS_BUT_SPIRAL', 'Wicket Gates (Distributor) are leaking water into runner faster than Bypass can fill the spiral.', 'DO NOT bridge the interlock.\nPerform Wicket Gate seal inspection.\nSee Distributor Synchronization SOP.', 'MEDIUM'),
  ('FRANCIS_SOP_OIL_HEALTH::MAPPING_AND_ROOT_CAUSES', '', '', 'MEDIUM'),
  ('FRANCIS_SOP_OIL_HEALTH::OIL_FOAMS_RHYTHMICALLY_WITH_PUMP_STROKE', '', '', 'MEDIUM'),
  ('FRANCIS_SOP_OIL_HEALTH::LARGE_BUBBLES_ON_OIL_SURFACE', '', '', 'MEDIUM'),
  ('FRANCIS_SOP_OIL_HEALTH::MILKY_CLOUDY_APPEARANCE_THROUGHOUT_VOLUME_OIL_LOOKS', '', '', 'MEDIUM'),
  ('FRANCIS_SOP_POST_MORTEM::ISOLATION', '', '', 'MEDIUM'),
  ('FRANCIS_SOP_REGULATING_RING::POWER_OUTPUT_HUNTING', '1:', '', 'MEDIUM'),
  ('FRANCIS_SOP_REGULATING_RING::HIGH_HPU_PRESSURE', '', '', 'MEDIUM'),
  ('FRANCIS_SOP_REGULATING_RING::ROOT_CAUSE_1_STICTION_IN_REGULATING_RING', 'Stiction in regulating ring → Check HPU pressure for sawtooth pattern.\nRoot Cause 2: Poor vane synchronization → Verify eccentric pin adjustment using feeler gauge.\nRoot Cause 3: Worn linkage bushings → Perform manual "wiggle test" on each vane arm (ref: Linkage SOP).', 'Stop unit, release pressure, manually lubricate ring.\nInvestigation: Check central greasing system - verify pump is building pressure and all dosage valves are flowing.', 'MEDIUM'),
  ('FRANCIS_SOP_REGULATING_RING::IMMEDIATE_ACTION_STOP_UNIT_RELEASE_PRESSURE_MANUALLY', '', 'Stop unit, release pressure, manually lubricate ring.\nInvestigation: Check central greasing system - verify pump is building pressure and all dosage valves are flowing.', 'MEDIUM'),
  ('FRANCIS_SYMPTOM_DICTIONARY_PUBLIC::DICTIONARY_ERROR_CODE_REPOSITORY', '', '', 'MEDIUM'),
  ('FRANCIS_SYMPTOM_DICTIONARY_PUBLIC::UNIVERSAL_ERROR_CODES_QUICK_REF_LOGIC', '', '', 'MEDIUM')
ON CONFLICT (symptom_key) DO UPDATE SET
  diagnosis = EXCLUDED.diagnosis,
  recommended_action = EXCLUDED.recommended_action,
  severity = EXCLUDED.severity;

COMMIT;
