import os
import logging
from datetime import datetime
from sqlalchemy import JSON, Column, DateTime, String, Integer, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import Generator

# Configurar logging profesional
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

is_serverless = os.environ.get("VERCEL") or os.environ.get("RENDER") or os.environ.get("PORT")
default_sqlite_path = "/tmp/local.db" if is_serverless else "./local.db"

DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    # Arreglo critico para Render/Heroku: postgres:// -> postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Soporte SSL para Render
    if "sslmode=" not in DATABASE_URL and "sqlite" not in DATABASE_URL:
        DATABASE_URL += ("&" if "?" in DATABASE_URL else "?") + "sslmode=require"
    logger.info("Using Production Database (PostgreSQL)")
else:
    DATABASE_URL = f"sqlite:///{default_sqlite_path}"
    logger.info(f"Using Local Database (SQLite): {DATABASE_URL}")

try:
    connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
    engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
except Exception as e:
    logger.error(f"Error creating engine: {e}")
    raise

class DatasetAnalysis(Base):
    __tablename__ = "dataset_analysis"
    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    status = Column(String, default="processing")
    error = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    analysis_result = Column(JSON, nullable=True)

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    plan = Column(String, default="starter")
    analyses_count = Column(Integer, default=0)
    analyses_limit = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_reset = Column(DateTime, default=datetime.utcnow)

def init_db() -> None:
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schemas initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
