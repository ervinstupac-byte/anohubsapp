import os
import enum
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, JSON, DateTime, Boolean, Text, Enum
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

# Setup
Base = declarative_base()
DATABASE_URL = "sqlite:///anohub_core_enhanced.db"
engine = create_engine(DATABASE_URL)

# ==========================================
# ENUMS & CONSTANTS
# ==========================================
class TurbineType(enum.Enum):
    KAPLAN_H = "Kaplan_Horizontal"
    KAPLAN_V = "Kaplan_Vertical"
    KAPLAN_PIT = "Kaplan_PIT"
    KAPLAN_BULB = "Kaplan_Bulb"
    KAPLAN_S = "Kaplan_S_Type"
    KAPLAN_SPIRAL = "Kaplan_Spiral"
    FRANCIS = "Francis"
    PELTON = "Pelton"

# ==========================================
# 1. CLUSTER: PROJECT GENESIS (The DNA)
# ==========================================
class ProjectGenesis(Base):
    __tablename__ = 'project_genesis_dna'
    
    id = Column(Integer, primary_key=True)
    project_name = Column(String, unique=True, nullable=False)
    
    # --- Hydrology & Geodesy ---
    geodetic_head_masl = Column(Float, nullable=False) # H_geo (e.g. Intake - Tailwater)
    design_flow_cms = Column(Float, nullable=False) # Q_i
    ecological_flow_cms = Column(Float)
    
    # --- Hydraulic Infrastructure ---
    penstock_length_m = Column(Float)
    penstock_diameter_mm = Column(Float)
    roughness_coefficient_mm = Column(Float, default=0.045) # k_s (Steel=0.045, GRP=0.01)
    
    # --- Safety Constraints (12mm vs 16mm Guard) ---
    pipe_diameter_limit_mm = Column(Float) # Mechanical constraint
    flow_velocity_max_ms = Column(Float, default=4.0) # V_max constraint to prevent water hammer
    
    # --- Calculated Attributes (AI deriving these) ---
    # net_head_m is calculated via logic: geodesy - losses(roughness, length, flow)
    calculated_net_head_m = Column(Float) 
    
    turbines = relationship("Turbine", back_populates="genesis")

# ==========================================
# 2. CLUSTER: ASSET DIGITAL TWIN
# ==========================================
class Turbine(Base):
    __tablename__ = 'turbines'
    
    id = Column(Integer, primary_key=True)
    genesis_id = Column(Integer, ForeignKey('project_genesis_dna.id'))
    
    # Strict Enum Specification
    turbine_type = Column(Enum(TurbineType), nullable=False)
    specific_speed_nq = Column(Float) # n_q classification
    
    components = relationship("MechanicalComponent", back_populates="turbine")
    sensors = relationship("SensorLog", back_populates="turbine")
    genesis = relationship("ProjectGenesis", back_populates="turbines")

class MechanicalComponent(Base):
    __tablename__ = 'mechanical_components_precision'
    
    id = Column(Integer, primary_key=True)
    turbine_id = Column(Integer, ForeignKey('turbines.id'))
    name = Column(String) # Runner, Wicket Gate, Guide Vane, Thrust Bearing
    
    # --- The 0.05 mm Precision Logic ---
    design_nominal_clearance_mm = Column(Float) # e.g. 0.80 mm
    measured_clearance_mm = Column(Float) # e.g. 0.84 mm
    tolerance_standard_mm = Column(Float, default=0.05) # "Alarm if deviation > 0.05"
    
    last_inspection_date = Column(DateTime, default=datetime.utcnow)
    
    turbine = relationship("Turbine", back_populates="components")

# ==========================================
# 3. CLUSTER: DECISION MATRIX & FORENSICS
# ==========================================
class SensorLog(Base):
    __tablename__ = 'realtime_sensor_logs'
    
    id = Column(Integer, primary_key=True)
    turbine_id = Column(Integer, ForeignKey('turbines.id'))
    timestamp = Column(DateTime, index=True, default=datetime.utcnow)
    
    # Critical Telemetry
    vibration_x_mm_s = Column(Float)
    vibration_y_mm_s = Column(Float)
    bearing_temp_c = Column(Float)
    oil_pressure_bar = Column(Float)
    active_power_mw = Column(Float)
    
    turbine = relationship("Turbine", back_populates="sensors")

class LegacyIncident(Base):
    __tablename__ = 'legacy_incidents'
    
    id = Column(Integer, primary_key=True)
    turbine_id = Column(Integer, ForeignKey('turbines.id'))
    incident_timestamp = Column(DateTime, nullable=False) # The "Time Zero" of the event
    
    description = Column(String)
    root_cause = Column(Text) # "12mm Penstock Deformation"
    
    # --- Forensics Link ---
    # This ID links to the SensorLog entry closest to the disaster
    black_box_start_log_id = Column(Integer, ForeignKey('realtime_sensor_logs.id'))
    
    legacy_solution = Column(Text) # Knowledge Base item

# ==========================================
# JSON SCHEMA GENERATOR
# ==========================================
def generate_genesis_schema():
    """Generates the JSON Schema for the Project Genesis Form Input"""
    schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Project Genesis DNA Input",
        "type": "object",
        "required": ["project_name", "geodetic_head_masl", "design_flow_cms", "penstock_diameter_mm", "pipe_material_roughness"],
        "properties": {
            "project_name": { "type": "string", "title": "Plant Name" },
            "geodetic_head_masl": { "type": "number", "minimum": 1.0, "title": "Gross Geodetic Head (m)" },
            "design_flow_cms": { "type": "number", "minimum": 0.1, "title": "Design Flow Qi (m3/s)" },
            "penstock_length_m": { "type": "number", "title": "Penstock Length (m)" },
            "penstock_diameter_mm": { "type": "number", "title": "Penstock Diameter (mm)" },
            "roughness_coefficient_mm": { 
                "type": "number", 
                "title": "Roughness k_s (mm)",
                "description": "Steel=0.045, GRP=0.01, Concrete=1.5"
            },
            "safety_constraints": {
                "type": "object",
                "properties": {
                    "max_flow_velocity_ms": { "type": "number", "default": 4.0 },
                    "max_pressure_bar": { "type": "number" }
                }
            }
        }
    }
    return json.dumps(schema, indent=4)

if __name__ == "__main__":
    print("🔹 Initializing AnoHUB Enhanced Core Database...")
    Base.metadata.create_all(engine)
    print("✅ Database Schema Applied.")
    
    print("\n🔹 Generated JSON Schema for Genesis Input:")
    print(generate_genesis_schema())
