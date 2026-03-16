from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# SQLite for development (can switch to PostgreSQL for production)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./assurance_twin.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class AssetModel(Base):
    __tablename__ = "assets"
    
    id = Column(String, primary_key=True)
    canonical_id = Column(String, unique=True, index=True)
    name = Column(String)
    asset_type = Column(String)
    location = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    mac_address = Column(String, nullable=True)
    vendor = Column(String, nullable=True)
    model = Column(String, nullable=True)
    firmware = Column(String, nullable=True)
    status = Column(String)
    sources = Column(JSON)  # List of source types
    conflicts = Column(JSON)  # List of conflicts
    confidence = Column(Float)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def get_db_session():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)








