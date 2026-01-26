import enum
from dataclasses import dataclass
from typing import List, Literal

class TurbineStatus(enum.Enum):
    RUNNING = "RUNNING"
    STOPPED = "STOPPED"
    SHUTDOWN_IN_PROGRESS = "SHUTDOWN_IN_PROGRESS"

@dataclass
class TempTrend:
    values: List[float]
    
    def is_increasing(self) -> bool:
        if len(self.values) < 2: return False
        # Simple check: is the last value significantly higher than the average of previous?
        # Or strictly monotonic increase?
        # Let's use the user's "Rate of Rise" concept.
        last_3 = self.values[-3:]
        if len(last_3) < 2: return False
        return last_3[-1] > last_3[-2] + 2.0 # Sudden 2 degree jump

class IntelligenceGuard:
    """
    The Intelligence Guard
    Prevents "Example 3" (Power Train Destruction) and manages Advanced Legacy Scenarios.
    """

    MAX_CYCLES_STANDBY = 5 # Max Grease cycles allowed while stopped before inspection needed

    @staticmethod
    def check_bearing_integrity(current_status: TurbineStatus, lubrication_cycles: int, temp_trend: TempTrend) -> str:
        """
        Scenario: The Greasing/Seal Disaster (PIT Kaplan) & Thermal Inertia
        """
        # Logic for Example 3: Too much grease during Standby
        if current_status == TurbineStatus.STOPPED and lubrication_cycles > IntelligenceGuard.MAX_CYCLES_STANDBY:
            return "CRITICAL: Excessive grease in seal area. Risk of seal blowout on startup! Perform Manual Seal Inspection."

        # Logic for Thermal Inertia (Temp rise after stop)
        if current_status == TurbineStatus.SHUTDOWN_IN_PROGRESS:
            if temp_trend.is_increasing():
                 return "EMERGENCY: Post-stop temperature surge! Potential bearing welding detected. Check Cooling flow."
                 
        return "STATUS_OK"

    @staticmethod
    def calculate_pelton_thermal_offset(machine_temp_c: float, shaft_length_m: float, ambient_temp_c: float = 20.0) -> dict:
        """
        Scenario: The Pelton Thermal Drift (Expansion Offset)
        Calculates required Jet-to-Bucket alignment offset for cold startup.
        """
        # Steel expansion coefficient approx 12e-6 per deg C
        alpha = 12e-6 
        
        delta_t = machine_temp_c - ambient_temp_c
        expansion_mm = (shaft_length_m * 1000) * alpha * delta_t
        
        # If machine is cold (e.g. 20C) and operating temp is 60C, 
        # the runner will move 'expansion_mm' during operation.
        # Therefore, cold alignment must offset this.
        
        required_cold_offset_mm = -expansion_mm
        
        return {
            "current_temp_c": machine_temp_c,
            "thermal_expansion_mm": round(expansion_mm, 3),
            "alignment_recommendation": f"Set cold nozzle offset by {round(required_cold_offset_mm, 3)}mm to compensate for growth."
        }

    @staticmethod
    def classify_damage_texture(texture_analysis: dict) -> dict:
        """
        Scenario: Cavitation vs. Erosion Forensic AI
        """
        smoothness = texture_analysis.get("smoothness_score", 0.5) # 0 = Porous, 1 = Polished
        sharpness = texture_analysis.get("edge_sharpness", 0.5)    # 0 = Dull, 1 = Sharp edges
        
        if smoothness > 0.8:
            return {
                "diagnosis": "EROSION (SAND/SEDIMENT)",
                "visual_signature": "Polished, smooth wear pattern.",
                "action": "Check Desilter (Taložnik) and Intake Filters."
            }
        elif smoothness < 0.4 and sharpness > 0.7:
             return {
                "diagnosis": "CAVITATION",
                "visual_signature": "Swiss-cheese texture (Porous, sharp pits).",
                "action": "Check Tailwater Level and Vacuum Breaker."
            }
        
        return {"diagnosis": "INDETERMINATE", "action": "Manual inspection required."}

# --- TEST EXECUTION ---
if __name__ == "__main__":
    print("--- 1. GREASE/SEAL DISASTER CHECK ---")
    print(IntelligenceGuard.check_bearing_integrity(
        TurbineStatus.STOPPED, 
        lubrication_cycles=8, 
        temp_trend=TempTrend([45, 45, 44])
    ))

    print("\n--- 2. THERMAL INERTIA CHECK ---")
    print(IntelligenceGuard.check_bearing_integrity(
        TurbineStatus.SHUTDOWN_IN_PROGRESS, 
        lubrication_cycles=0, 
        temp_trend=TempTrend([55, 58, 62]) # Increasing!
    ))

    print("\n--- 3. PELTON THERMAL DRIFT ---")
    # 5m Shaft, Cold Start (20C) vs Operating (65C -> Delta 45C)
    print(IntelligenceGuard.calculate_pelton_thermal_offset(machine_temp_c=65, shaft_length_m=5.0))

    print("\n--- 4. VISUAL FORENSICS ---")
    print("Case A:", IntelligenceGuard.classify_damage_texture({"smoothness_score": 0.9, "edge_sharpness": 0.2}))
    print("Case B:", IntelligenceGuard.classify_damage_texture({"smoothness_score": 0.2, "edge_sharpness": 0.9}))
