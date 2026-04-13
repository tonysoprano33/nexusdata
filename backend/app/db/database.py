import os
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, String, Integer, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Usar /tmp para SQLite en serverless/producción (efímero pero funcional)
# Render y Vercel no persisten archivos locales entre deploys
is_serverless = os.environ.get("VERCEL") or os.environ.get("RENDER") or os.environ.get("PORT")
default_sqlite_path = "/tmp/local.db" if is_serverless else "./local.db"

# Usar SQLite por defecto (no requiere servidor PostgreSQL)
# Para producción, cambiar a: postgresql://user:pass@localhost:5432/dbname
DATABASE_URL = os.environ.get(
    "DATABASE_URL", f"sqlite:///{default_sqlite_path}"
)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


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
    plan = Column(String, default="starter")  # starter, pro, enterprise
    analyses_count = Column(Integer, default=0)
    analyses_limit = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_reset = Column(DateTime, default=datetime.utcnow)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
