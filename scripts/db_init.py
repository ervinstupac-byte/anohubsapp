import os
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, JSON, DateTime, Boolean, Text
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime

# Setup
Base = declarative_base()
DATABASE_URL = "sqlite:///anohub_core.db" # Local DB for the "Consultant-in-a-box" standalone version
engine = create_engine(DATABASE_URL)

# ==========================================
# CLUSTER 1: PROJECT GENESIS (The DNA)
# ==========================================
class Plant(Base):
    __tablename__ = 'plants'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    location_name = Column(String)
    gps_lat = Column(Float)
    gps_lng = Column(Float)
    elevation_masl = Column(Float) # Meters above sea level
    
    # Relationships
    hydrology = relationship("HydrologyData", uselist=False, back_populates="plant")
    pipe_specs = relationship("PipeSpecs", uselist=False, back_populates="plant")
    turbines = relationship("Turbine", back_populates="plant")
    bids = relationship("BidEvaluation", back_populates="plant")

class HydrologyData(Base):
    __tablename__ = 'hydrology_data'
    id = Column(Integer, primary_key=True)
    plant_id = Column(Integer, ForeignKey('plants.id'))
    net_head_m = Column(Float)
    installed_flow_cms = Column(Float) # Q_i
    ecological_flow_cms = Column(Float)
    flow_duration_curve = Column(JSON) # JSON: [{"prob": 10, "flow": 12.5}, ...]
    
    plant = relationship("Plant", back_populates="hydrology")

class PipeSpecs(Base):
    __tablename__ = 'pipe_specs'
    id = Column(Integer, primary_key=True)
    plant_id = Column(Integer, ForeignKey('plants.id'))
    material = Column(String) # Steel, GRP, PEHD
    diameter_mm = Column(Integer)
    length_m = Column(Float)
    wall_thickness_mm = Column(Float)
    roughness_coeff_mm = Column(Float) # k_s
    
    plant = relationship("Plant", back_populates="pipe_specs")

class BidEvaluation(Base):
    __tablename__ = 'bid_evaluations'
    id = Column(Integer, primary_key=True)
    plant_id = Column(Integer, ForeignKey('plants.id'))
    manufacturer = Column(String)
    turbine_type = Column(String)
    promised_efficiency = Column(Float)
    price_eur = Column(Float)
    delivery_months = Column(Integer)
    status = Column(String) # PENDING, REJECTED, SHORTLIST
    
    plant = relationship("Plant", back_populates="bids")

# ==========================================
# CLUSTER 2: ASSET DIGITAL TWIN
# ==========================================
class Turbine(Base):
    __tablename__ = 'turbines'
    id = Column(Integer, primary_key=True)
    plant_id = Column(Integer, ForeignKey('plants.id'))
    turbine_type = Column(String) # Kaplan, Francis, Pelton
    orientation = Column(String) # Horizontal, Vertical
    specific_speed_nq = Column(Float) # n_q
    runner_diameter_mm = Column(Float)
    
    components = relationship("Component", back_populates="turbine")
    plant = relationship("Plant", back_populates="turbines")

class Component(Base):
    __tablename__ = 'components'
    id = Column(Integer, primary_key=True)
    turbine_id = Column(Integer, ForeignKey('turbines.id'))
    name = Column(String) # Runner, Shaft, Bearing
    material = Column(String)
    tolerance_standard_mm = Column(Float, default=0.05) # The "0.05mm" rule
    last_inspection_date = Column(DateTime)
    
    turbine = relationship("Turbine", back_populates="components")

class GeneratorSpec(Base):
    __tablename__ = 'generator_specs'
    id = Column(Integer, primary_key=True)
    turbine_id = Column(Integer, ForeignKey('turbines.id'))
    rated_power_kva = Column(Float)
    voltage_v = Column(Float)
    frequency_hz = Column(Float)
    excitation_type = Column(String) # Brushless, Static

# ==========================================
# CLUSTER 3: DECISION MATRIX (Real-time)
# ==========================================
class SensorLog(Base):
    __tablename__ = 'sensor_logs'
    id = Column(Integer, primary_key=True)
    turbine_id = Column(Integer, ForeignKey('turbines.id'))
    timestamp = Column(DateTime, default=datetime.utcnow)
    vibration_mm_s = Column(Float)
    temp_bearing_c = Column(Float)
    temp_oil_c = Column(Float)
    pressure_bar = Column(Float)
    acoustic_db = Column(Float)

class OilChemistry(Base):
    __tablename__ = 'oil_chemistry_logs'
    id = Column(Integer, primary_key=True)
    turbine_id = Column(Integer, ForeignKey('turbines.id'))
    sample_date = Column(DateTime)
    viscosity_40c = Column(Float)
    tan = Column(Float) # Total Acid Number
    particle_count_iso = Column(String) # "18/16/13"
    babbitt_particles_ppm = Column(Float) # Critical bearing wear indicator

class Threshold(Base):
    __tablename__ = 'thresholds'
    id = Column(Integer, primary_key=True)
    turbine_id = Column(Integer, ForeignKey('turbines.id'))
    sensor_type = Column(String) # "VIBRATION", "TEMP_BEARING"
    warning_limit = Column(Float)
    shutdown_limit = Column(Float)
    is_dynamic = Column(Boolean, default=True) # Does it change with load?

# ==========================================
# CLUSTER 4: LEGACY MODE & FORENSICS
# ==========================================
class LegacyIncident(Base):
    __tablename__ = 'legacy_incidents'
    id = Column(Integer, primary_key=True)
    code = Column(String) # e.g. "KM-2024"
    incident_type = Column(String)
    symptoms = Column(JSON) # ["vibes", "knocking"]
    wrong_diagnosis = Column(Text)
    root_cause = Column(Text) # "12mm vs 16mm hydraulics"
    solution = Column(Text)
    
class EngineeringNote(Base):
    __tablename__ = 'engineering_notes'
    id = Column(Integer, primary_key=True)
    turbine_id = Column(Integer, ForeignKey('turbines.id'))
    author = Column(String, default="Chief Engineer")
    note = Column(Text) # "Ovaj vijak uvijek pretegnuti za 5Nm"
    created_at = Column(DateTime, default=datetime.utcnow)

class BlackBoxTrigger(Base):
    __tablename__ = 'black_box_triggers'
    id = Column(Integer, primary_key=True)
    turbine_id = Column(Integer, ForeignKey('turbines.id'))
    timestamp = Column(DateTime)
    trigger_reason = Column(String) # "Vibration Spike > 12mm/s"
    data_blob_path = Column(String) # Path to 30s binary dump

# Init DB
def init_db():
    print("Initializing AnoHUB Core Database Schema...")
    Base.metadata.create_all(engine)
    print("✅ Database Tables Created Successfully.")
    print("   - Project Genesis (Plants, Hydrology, Pipes, Bids)")
    print("   - Asset Twin (Turbines, Components, Generators)")
    print("   - Decision Matrix (Sensors, Oil, Thresholds)")
    print("   - Legacy Mode (Incidents, Notes, BlackBox)")

if __name__ == "__main__":
    init_db()
