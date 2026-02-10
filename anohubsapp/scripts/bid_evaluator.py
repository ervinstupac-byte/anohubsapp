import math

class BidEvaluator:
    """
    AnoHUB Bid Evaluator Engine (Python Edition)
    Validates manufacturer offers against physical limits.
    """
    
    # Theoretical maximum efficiency limits (%) based on physics & empirical data (IEC 60041)
    THEORETICAL_LIMITS = {
        'kaplan': 95.0,
        'francis': 96.5,
        'pelton': 92.5
    }

    def __init__(self, net_head_m: float, design_flow_cms: float):
        """
        Initialize with site-specific partials.
        :param net_head_m: Net Head (Hn) in meters
        :param design_flow_cms: Design Flow (Q) in cubic meters per second
        """
        self.hn = net_head_m
        self.q = design_flow_cms
        # P = rho * g * Q * H * eta_approx (assuming 90% for rough calc)
        self.approx_power_kw = 1000 * 9.81 * self.q * self.hn * 0.90

    def evaluate_offer(self, manufacturer: str, turbine_type: str, offered_efficiency: float, price_eur: float):
        """
        Evaluates a single bid.
        """
        turbine_type = turbine_type.lower()
        report = {
            "manufacturer": manufacturer,
            "status": "PENDING",
            "warnings": [],
            "score": 100
        }

        # 1. PHYSICS CHECK: Efficiency
        limit = self.THEORETICAL_LIMITS.get(turbine_type, 90.0)
        if offered_efficiency > limit:
            report["warnings"].append(f"CRITICAL: Claimed efficiency {offered_efficiency}% exceeds theoretical physical limit for {turbine_type} ({limit}%). Marketing exaggeration likely.")
            report["score"] -= 50
        elif offered_efficiency > limit - 1.0:
             report["warnings"].append(f"WARNING: Claimed efficiency {offered_efficiency}% is extremely close to theoretical limit. Verify IEC 60041 model test.")
             report["score"] -= 20

        # 2. APPLICATION MATRIX CHECK (Head vs Type)
        if turbine_type == 'kaplan' and self.hn > 80:
            report["warnings"].append(f"RISK: Kaplan turbine at {self.hn}m head has extreme cavitation risk. Suggest Francis.")
            report["score"] -= 30
        elif turbine_type == 'francis' and self.hn < 20:
             report["warnings"].append(f"ECONOMIC: Francis at {self.hn}m might be too expensive due to spiral case size. Suggest Kaplan/Bulb.")
             report["score"] -= 15

        # 3. SPECIFIC SPEED CHECK (N_s approximation)
        # Ns = n * sqrt(P) / H^(5/4) -> roughly checks if the machine shape makes sense
        # Skipped for brevity, but would be Step 3.

        # FINAL VERDICT
        if report["score"] > 80:
            report["status"] = "SHORTLIST"
        elif report["score"] > 50:
            report["status"] = "NEGOTIATE"
        else:
            report["status"] = "REJECT"

        return report

# --- USAGE EXAMPLE ---
if __name__ == "__main__":
    # Site: 45m Head, 12 m3/s Flow
    site_eval = BidEvaluator(net_head_m=45, design_flow_cms=12)
    
    # Bid 1: Honest Spec
    bid1 = site_eval.evaluate_offer("HydroTech Austria", "francis", 94.5, 1500000)
    print(f"Bid 1: {bid1}")
    
    # Bid 2: Marketing Lie
    bid2 = site_eval.evaluate_offer("SketchyTurbines Inc.", "francis", 98.0, 1200000)
    print(f"Bid 2: {bid2}")
