import enum
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Enum, Text, Boolean
from sqlalchemy.sql import func
from database import Base


class VerificationStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    disputed = "disputed"
    unverifiable = "unverifiable"


class ShiftLog(Base):
    __tablename__ = "shift_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    worker_id = Column(Integer, nullable=False, index=True)
    platform = Column(String(50), nullable=False, index=True)  # Careem, Foodpanda, Bykea, etc.
    date = Column(Date, nullable=False)
    hours_worked = Column(Float, nullable=False)
    gross_earned = Column(Float, nullable=False)
    platform_deductions = Column(Float, nullable=False, default=0)
    net_received = Column(Float, nullable=False)
    city = Column(String(50), nullable=True, index=True)
    zone = Column(String(100), nullable=True)  # City zone for analytics
    category = Column(String(50), nullable=True, default="ride_hailing")  # ride_hailing, delivery, freelance, domestic
    notes = Column(Text, nullable=True)

    # Screenshot verification
    screenshot_url = Column(String(500), nullable=True)
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.pending)
    verified_by = Column(Integer, nullable=True)  # verifier user_id
    verification_notes = Column(Text, nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
