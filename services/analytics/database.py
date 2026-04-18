import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Analytics service reads from the earnings database (read-only)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EARNINGS_DB_PATH = os.path.join(BASE_DIR, "..", "earnings", "earnings.db")
EARNINGS_DB_URL = f"sqlite:///{EARNINGS_DB_PATH}"

earnings_engine = create_engine(EARNINGS_DB_URL, connect_args={"check_same_thread": False})
EarningsSession = sessionmaker(autocommit=False, autoflush=False, bind=earnings_engine)


def get_earnings_db():
    db = EarningsSession()
    try:
        yield db
    finally:
        db.close()
