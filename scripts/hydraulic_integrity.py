import json

# ==========================================
# 1. STRUCTURED LEGACY INCIDENT (JSON)
# ==========================================
legacy_incident_data = {
    "incident_id": "LEG-HYD-001",
    "title": "Rotor Head Piping Diameter Mismatch",
    "incident_type": "HYDRAULIC_SHOCK",
    "component_context": {
        "system": "GOVERNOR_HYDRAULICS",
        "subsystem": "ROTOR_HEAD_PIPING",
        "designed_diameter_mm": 12.0
    },
    "root_cause_analysis": {
        "primary_cause": "UNAUTHORIZED_MODIFICATION",
        "description": "Field modification from 12mm to 16mm piping reduced dynamic resistance.",
        "physics_effect": "Lower resistance increased flow rate (Q), causing higher dQ/dt allowed during closing, resulting in non-linear water hammer."
    },
    "safety_constraints": {
        "parameter_monitored": "pipe_diameter_mm",
        "max_variance_percent": 15.0,
        "critical_action": "PREVENT_STARTUP"
    },
    "pattern_matching_signature": {
        "sensor_type": "PRESSURE_TRANSDUCER_SERVO",
        "waveform_type": "NON_LINEAR_SPIKE",
        "trigger_gradient_bar_per_sec": 50.0  # e.g., >50 bar/s rise matches the accident profile
    }
}

# ==========================================
# 2. PYTHON SAFETY LOGIC
# ==========================================
class HydraulicSafetyVerify:
    
    @staticmethod
    def check_hydraulic_integrity(
        designed_diameter_mm: float, 
        field_modified_diameter_mm: float, 
        current_pressure_gradient: float
    ) -> dict:
        """
        Evaluates hydraulic safety based on design compliance and real-time sensor patterns.
        
        :param designed_diameter_mm: The specification from Project Genesis (e.g., 12mm)
        :param field_modified_diameter_mm: The actual measured/input diameter on site
        :param current_pressure_gradient: Real-time dP/dt from sensors (bar/s)
        :return: Safety Assessment Dictionary
        """
        
        result = {
            "status": "NORMAL",
            "warnings": [],
            "action": "NONE"
        }

        # --- CHECK 1: CONFIGURATION INTEGRITY (The 15% Rule) ---
        deviation = abs(field_modified_diameter_mm - designed_diameter_mm)
        variance_percent = (deviation / designed_diameter_mm) * 100
        
        if variance_percent > 15.0:
            result["status"] = "CRITICAL_ALARM"
            result["warnings"].append(
                f"UNAUTHORIZED HYDRAULIC MODIFICATION: Diameter {field_modified_diameter_mm}mm deviates {variance_percent:.1f}% from design ({designed_diameter_mm}mm). Max allowed 15%."
            )
            result["action"] = "LOCKOUIT_PREVENT_STARTUP"
            
            # Physics Context addition based on known legacy issue
            if field_modified_diameter_mm > designed_diameter_mm:
                 result["warnings"].append("Physics Note: Larger diameter reduces damping, increasing Water Hammer risk!")

        # --- CHECK 2: REAL-TIME PATTERN MATCHING (The 'Ghost' Trigger) ---
        # Using the signature from our structured JSON
        incident_trigger_gradient = legacy_incident_data["pattern_matching_signature"]["trigger_gradient_bar_per_sec"]
        
        if current_pressure_gradient > incident_trigger_gradient:
            result["status"] = "EMERGENCY"
            result["warnings"].append(
                f"LEGACY PATTERN DETECTED: Pressure spike {current_pressure_gradient} bar/s matches historical incident {legacy_incident_data['incident_id']}."
            )
            result["action"] = "INITIATE_SAFE_SHUTDOWN_SEQUENCE"

        return result

# ==========================================
# 3. EXECUTION TEST
# ==========================================
if __name__ == "__main__":
    print("--- SCENARIO 1: Normal Operation ---")
    print(json.dumps(HydraulicSafetyVerify.check_hydraulic_integrity(12.0, 12.1, 5.0), indent=2))
    
    print("\n--- SCENARIO 2: The '12mm to 16mm' Mistake (Static Check) ---")
    # Worker installed 16mm pipe instead of 12mm
    print(json.dumps(HydraulicSafetyVerify.check_hydraulic_integrity(12.0, 16.0, 10.0), indent=2))

    print("\n--- SCENARIO 3: Real-time Disaster Pattern (Dynamic Check) ---")
    # Pipe is wrong AND pressure is spiking
    print(json.dumps(HydraulicSafetyVerify.check_hydraulic_integrity(12.0, 16.0, 65.0), indent=2))
