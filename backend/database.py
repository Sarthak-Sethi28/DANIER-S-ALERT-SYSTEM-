from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Enhanced database URL with performance optimizations
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./danier_stock_alert.db")

# High-performance engine configuration
engine = create_engine(
    DATABASE_URL,
    # Performance optimizations
    pool_size=20,           # Increased from default 5
    max_overflow=50,        # Increased from default 10
    pool_timeout=60,        # Increased timeout
    pool_recycle=3600,      # Recycle connections every hour
    pool_pre_ping=True,     # Validate connections
    echo=False,             # Disable SQL logging for speed
    connect_args={
        "check_same_thread": False,
        "timeout": 30           # SQLite timeout
    } if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

def init_db():
    from models import Base
    Base.metadata.create_all(bind=engine)

# Initialize database tables
init_db() 