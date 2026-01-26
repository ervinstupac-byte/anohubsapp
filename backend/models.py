import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, Text, Boolean
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# ==========================================
# 1. ENUMS
# ==========================================
class TurbineTypev2(enum.Enum):
    KAPLAN_H = "Kaplan_Horizontal_S_Type"
    KAPLAN_V = "Kaplan_Vertical"
    KAPLAN_PIT = "Kaplan_PIT_Type"
    KAPLAN_BULB = "Kaplan_Bulb"
    FRANCIS = "Francis_Vertical"
    FRANCIS_H = "Francis_Horizontal"
    PELTON = "Pelton_Vertical"
    PELTON_H = "Pelton_Horizontal"

# ==========================================
# 2. CORE SCHEMA: PROJECT GENESIS
# ==========================================
class Plant(Base):
    __tablename__ = 'plants'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    location_code = Column(String)
    
    # Hydrology
    gross_head_m = Column(Float) # H_gross
    design_flow_cms = Column(Float) # Q_i
    
    # Calculated / Verified
    net_head_m = Column(Float) # Calculated by AuditEngine
    
    turbines = relationship("Turbine", back_populates="plant")
    hydraulic_specs = relationship("HydraulicSpec", uselist=False, back_populates="plant")

class HydraulicSpec(Base):
    """
    Prevents '12mm-to-16mm' risks by strictly defining authorized specs.
    """
    __tablename__ = 'hydraulic_specs'
    
    id = Column(Integer, primary_key=True)
    plant_id = Column(Integer, ForeignKey('plants.id'))
    
    penstock_diameter_mm = Column(Float, nullable=False)
    design_pressure_bar = Column(Float)
    material_roughness_ks = Column(Float, default=0.045) # Steel default
    
    # Safety Constraint
    max_flow_velocity_ms = Column(Float, default=4.0) 
    
    plant = relationship("Plant", back_populates="hydraulic_specs")

# ==========================================
# 3. ASSET DIGITAL TWIN
# ==========================================
class Turbine(Base):
    __tablename__ = 'turbines'
    
    id = Column(Integer, primary_key=True)
    plant_id = Column(Integer, ForeignKey('plants.id'))
    
    turbine_type = Column(Enum(TurbineTypev2), nullable=False)
    serial_number = Column(String)
    
    # Operational Status
    status = Column(String) # RUNNING, STOPPED, STBY
    standby_cycles_counter = Column(Integer, default=0) # For Legacy #3 Check
    
    components = relationship("MechanicalComponent", back_populates="turbine")
    sensors = relationship("Sensor", back_populates="turbine")
    incidents = relationship("LegacyIncident", back_populates="turbine")
    plant = relationship("Plant", back_populates="turbines")

class MechanicalComponent(Base):
    __tablename__ = 'mechanical_components'
    
    id = Column(Integer, primary_key=True)
    turbine_id = Column(Integer, ForeignKey('turbines.id'))
    name = Column(String) # e.g. "Upper Guide Bearing"
    
    # Precision Engineering (0.05 mm Standard)
    nominal_clearance_mm = Column(Float)
    measured_clearance_mm = Column(Float)
    
    # Computed Deviation (could be property, but storing for history)
    deviation_mm = Column(Float)
    
    last_measured_at = Column(DateTime, default=datetime.utcnow)
    
    turbine = relationship("Turbine", back_populates="components")

# ==========================================
# 4. SENSORS & LEGACY KNOWLEDGE
# ==========================================
class Sensor(Base):
    __tablename__ = 'sensors'
    
    id = Column(Integer, primary_key=True)
    turbine_id = Column(Integer, ForeignKey('turbines.id'))
    sensor_type = Column(String) # TEMP_BEARING, PRESSURE_PENSTOCK
    
    current_value = Column(Float)
    unit = Column(String)
    
    last_update = Column(DateTime)
    
    turbine = relationship("Turbine", back_populates="sensors")

class LegacyIncident(Base):
    """
    The 'Black Box' of experience (15 Years).
    Mapped to Sensor Logs for forensics.
    """
    __tablename__ = 'legacy_incidents'
    
    id = Column(Integer, primary_key=True)
    turbine_id = Column(Integer, ForeignKey('turbines.id'))
    
    incident_code = Column(String) # LEGACY#3
    description = Column(String)
    prevented_loss_eur = Column(Float) # financial impact
    
    detected_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)
    
    turbine = relationship("Turbine", back_populates="incidents")
