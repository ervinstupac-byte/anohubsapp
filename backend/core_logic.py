import math
from typing import List, Dict, Optional
from datetime import datetime, timedelta

# ==========================================
# 1. THE LEGACY WATCHER
# ==========================================
class LegacyWatcher:
    """
    Prevents known failures based on 15 years of experience.
    """
    MAX_STANDBY_GREASE_CYCLES = 20  # Risk trigger
    DANGEROUS_TEMP_RISE_RATE = 2.0  # Deg C / min

    @staticmethod
    def check_grease_risk(status: str, cycles: int) -> Optional[Dict]:
        """
        Legacy #3: Detects excessive greasing during standby.
        """
        if status in ["STOPPED", "STBY"] and cycles > LegacyWatcher.MAX_STANDBY_GREASE_CYCLES:
            return {
                "id": "LEGACY #3",
                "risk": "CRITICAL",
                "message": f"Excessive Grease ({cycles} cycles). Seal blowout risk!",
                "prevention_value_eur": 45000
            }
        return None

    @staticmethod
    def check_thermal_inertia(history: List[float], timestamps: List[datetime]) -> Optional[Dict]:
        """
        Detects post-shutdown bearing temperature surge.
        """
        if len(history) < 2: return None
        
        # Calculate Rate of Rise (degC per minute)
        t1, t2 = timestamps[-2], timestamps[-1]
        temp1, temp2 = history[-2], history[-1]
        
        delta_min = (t2 - t1).total_seconds() / 60.0
        if delta_min <= 0: return None
        
        rate = (temp2 - temp1) / delta_min
        
        if rate > LegacyWatcher.DANGEROUS_TEMP_RISE_RATE:
             return {
                "id": "LEGACY_THERMAL_INERTIA",
                "risk": "EMERGENCY",
                "message": f"Rapid Compounding Heat detected! Rate: {rate:.1f}°C/min. SHAFT SEIZURE IMMINENT.",
                "action": "Enable Emergency AC/DC Oil Pump & Cooling Boost"
            }
        return None

# ==========================================
# 2. THERMAL OFFSET MODULE
# ==========================================
class ThermalOffsetCalculator:
    """
    Legacy #4: Calculates required misalignment to compensate for expansion.
    """
    STEEL_EXPANSION_COEFF = 12e-6 # per deg C

    @staticmethod
    def calculate_pelton_expansion(shaft_length_m: float, ambient_c: float, operating_c: float) -> Dict:
        delta_t = operating_c - ambient_c
        expansion_mm = (shaft_length_m * 1000) * ThermalOffsetCalculator.STEEL_EXPANSION_COEFF * delta_t
        
        # We need a NEGATIVE offset cold so it grows roughly to ZERO alignment hot
        required_offset = -1 * expansion_mm
        
        return {
            "delta_t": delta_t,
            "expansion_mm": round(expansion_mm, 4),
            "required_cold_offset_mm": round(required_offset, 4),
            "validation_note": f"Set machine center {required_offset}mm lower/shorter to align at {operating_c}°C."
        }

# ==========================================
# 3. PROJECT GENESIS & AUDIT ENGINE
# ==========================================
class AuditEngine:
    """
    Validates Manufacturer claims and calculates Net Head physics.
    """
    GRAVITY = 9.81

    @staticmethod
    def calculate_net_head(gross_head: float, flow: float, pipe_length: float, diameter_mm: float, roughness_ks: float = 0.045) -> float:
        """
        Calculates Net Head (Hn) using Darcy-Weisbach friction loss logic.
        """
        d_m = diameter_mm / 1000.0
        area = math.pi * (d_m / 2)**2
        velocity = flow / area
        
        # Dynamic Head (V^2/2g) - usually not lost but converted, but friction usage here:
        # Darcy Friction Factor (Colebrook-White approximation or Swamee-Jain)
        # Using Swamee-Jain for explicit calculation
        if roughness_ks == 0: roughness_ks = 0.001
        epsilon = (roughness_ks / 1000.0) / d_m
        if epsilon <= 0: epsilon = 0.00001
        
        # Reynolds Number (assuming 10'C water approx viscosity 1.3e-6)
        viscosity = 1.307e-6
        re = (velocity * d_m) / viscosity
        
        if re < 2000: f = 64/re
        else:
            f = 0.25 / (math.log10( (epsilon/3.7) + (5.74 / re**0.9) ))**2
            
        friction_loss = f * (pipe_length / d_m) * (velocity**2 / (2 * AuditEngine.GRAVITY))
        local_losses = 0.1 * (velocity**2 / (2 * AuditEngine.GRAVITY)) # 10% assumption for bends/valves
        
        net_head = gross_head - friction_loss - local_losses
        return round(net_head, 3)

    @staticmethod
    def validate_manufacturer_bid(bid_efficiency_percent: float, turbine_type: str, net_head: float) -> Dict:
        """
        Flags if offered efficiency is theoretical 'Marketing Lies'.
        """
        # Physical limits based on 2025 technology standards
        limits = {
            "PELTON": 92.5,
            "FRANCIS": 96.5,
            "KAPLAN": 95.5
        }
        
        base_type = turbine_type.split('_')[0].upper() # extract KAPLAN from KAPLAN_H
        limit = limits.get(base_type, 94.0)
        
        is_lie = bid_efficiency_percent > limit
        
        return {
            "bid_value": bid_efficiency_percent,
            "physics_limit": limit,
            "verdict": "MARKETING_LIE" if is_lie else "PLAUSIBLE",
            "message": f"Bid {bid_efficiency_percent}% exceeds limit {limit}%!" if is_lie else "Efficiency within physical bounds."
        }

if __name__ == "__main__":
    print("--- CORE LOGIC DIAGNOSTICS ---")
    
    # Test 1: Net Head
    hn = AuditEngine.calculate_net_head(gross_head=100, flow=5.0, pipe_length=500, diameter_mm=1200, roughness_ks=0.045)
    print(f"Calculated Net Head: {hn} m")
    
    # Test 2: Bid Lie Detector
    print(AuditEngine.validate_manufacturer_bid(98.0, "FRANCIS", hn))
    
    # Test 3: Thermal Offset
    print(ThermalOffsetCalculator.calculate_pelton_expansion(shaft_length_m=5.0, ambient_c=12, operating_c=55))
