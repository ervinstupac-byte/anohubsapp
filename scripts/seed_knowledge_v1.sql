-- SQL Seed: expert_knowledge_base (generated)
-- WARNING: Review before running in production. This file was generated from extracted_expert_knowledge_refined.json

BEGIN;

-- Upsert statements (ON CONFLICT update diagnosis, recommended_action, severity)

INSERT INTO public.expert_knowledge_base (symptom_key, diagnosis, recommended_action, severity)
VALUES
  ('LOG._COMPONENT_FRANCIS_OBSERVATION_LOG_ROLE_DESCRIBED_FOR_DI', '', '', 'MEDIUM'),
  ('DICTIONARY_|_ANOHUB_ENGINEERING_VAULT', '', '', 'MEDIUM'),
  ('DICTIONARY', '', '', 'MEDIUM'),
  ('DICTIONARY.', '', '', 'MEDIUM'),
  ('DICTIONARY._COMPONENT_FRANCIS_SYMPTOM_DICTIONARY_ROLE_DESCRIBED_FOR_DIAGNOSTIC_PRIORITIZATION.', '', '', 'MEDIUM'),
  ('CEREBRO_INGESTION:_2026-01-17_18:35:02_SHA-256:_1D1578B19', 'Engineering Justification\n\n                    \n\n                        Validated engineering data for Francis Symptom Dictionary.\n                    \n\n\n\nNC-9.5 — AUXILIARY\nparam = 2.74\nAuxiliary param 2.74 used for diagnostics on francis symptom dictionary. Component francis symptom dictionary role described for diagnostic prioritization.\n\nAnalyzing specific cavitation risk (sigma=0.152) and torque (M=976745.145 N·m) for turbine_friend/francis_symptom_dictionary/index.html. — Calculated specifically for turbine_friend/francis_symptom_dictionary/index.html', '', 'MEDIUM'),
  ('DICTIONARY._COMPONENT_FRANCIS_SYMPTOM_DICTIONARY_ROLE_DESCRI', '', '', 'MEDIUM'),
  ('DICTIONARY._(INSTANCE_2)', '', '', 'MEDIUM'),
  ('DICTIONARY._(INSTANCE_3)', '', '', 'MEDIUM'),
  ('CEREBRO_INGESTION:_2026-01-17_18:35:02_SHA-256:_20B83DEE2', 'Engineering Justification\n                    \n\n                        Validated engineering data for Francis Symptom Dictionary.\n                    \n\n\n\nNC-9.5 — AUXILIARY\nparam = 8.615\nAuxiliary param 8.615 used for diagnostics on francis symptom dictionary. Component francis symptom dictionary role described for diagnostic prioritization.\n\nAnalyzing specific cavitation risk (sigma=0.098) and torque (M=409280.319 N·m) for turbine_friend/francis_h/francis_symptom_dictionary/index.html. — Calculated specifically for turbine_friend/francis_h/francis_symptom_dictionary/index.html', '', 'MEDIUM'),
  ('HUNTING', '', '', 'MEDIUM'),
  ('ERRATIC_GUIDE_VANE_MOVEMENT_(>2%___________________________', '', '', 'MEDIUM'),
  ('MILKY', '', '', 'MEDIUM'),
  ('AWARENESS:', '', '', 'MEDIUM'),
  ('SPEED_OSCILLATES_±0.2_-_0.5_RPM_AT_REGULAR_FREQUENCY_(E.G._E', 'Root Causes', '', 'MEDIUM'),
  ('(HIGH_SILT)_CAN_CASCADE_THROUGH_4', '', '', 'MEDIUM'),
  ('SCENARIO:_BYPASS_VALVE_OPENS,_BUT____________________SPIRAL', 'Wicket Gates\n                    (Distributor) are leaking water into runner faster than Bypass can fill the spiral.', 'DO NOT bridge the interlock.\nPerform Wicket Gate seal inspection.\nSee Distributor Synchronization SOP.', 'MEDIUM'),
  ('MAPPING_&_ROOT_CAUSES', '', '', 'MEDIUM'),
  ('OIL_FOAMS_RHYTHMICALLY_WITH_PUMP_STROKE.', '', '', 'MEDIUM'),
  ('LARGE_BUBBLES_(>_1_MM)_ON_OIL_SURFACE,_FORMING_AND', '', '', 'MEDIUM'),
  ('MILKY,_CLOUDY_APPEARANCE_THROUGHOUT_VOLUME._OIL_LOOKS', '', '', 'MEDIUM'),
  ('ISOLATION', '', '', 'MEDIUM'),
  ('POWER_OUTPUT_"HUNTING"_(±5%_OSCILLATION)', '1:', '', 'MEDIUM'),
  ('HIGH_HPU_PRESSURE_(>165_BAR_DURING_NORMAL_OPERATION)', '', '', 'MEDIUM'),
  ('ROOT_CAUSE_1:_STICTION_IN_REGULATING_RING_→_CHECK_HPU_PRESSU', 'Stiction in regulating ring → Check HPU pressure\n                    for sawtooth pattern.\nRoot Cause 2: Poor vane synchronization → Verify eccentric pin\n                    adjustment using feeler gauge.\nRoot Cause 3: Worn linkage bushings → Perform manual "wiggle\n                    test" on each vane arm (ref: Linkage SOP).', 'Stop unit, release pressure, manually\n                    lubricate ring.\nInvestigation: Check central greasing system - verify pump is\n                    building pressure and all dosage valves are flowing.', 'MEDIUM'),
  ('IMMEDIATE_ACTION:_STOP_UNIT,_RELEASE_PRESSURE,_MANUALLY____', '', 'Stop unit, release pressure, manually\n                    lubricate ring.\nInvestigation: Check central greasing system - verify pump is\n                    building pressure and all dosage valves are flowing.', 'MEDIUM'),
  ('DICTIONARY_-_ERROR_CODE_REPOSITORY', '', '', 'MEDIUM'),
  ('UNIVERSAL_ERROR_CODES_&_QUICK-REF_LOGIC', '', '', 'MEDIUM')
ON CONFLICT (symptom_key) DO UPDATE SET
  diagnosis = EXCLUDED.diagnosis,
  recommended_action = EXCLUDED.recommended_action,
  severity = EXCLUDED.severity;

COMMIT;
