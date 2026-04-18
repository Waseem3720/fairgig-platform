from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class VerificationStatus(str, Enum):
    pending = "pending"
    verified = "verified"
    disputed = "disputed"
    unverifiable = "unverifiable"


# ---- Request Schemas ----

class ShiftLogCreate(BaseModel):
    platform: str
    date: date
    hours_worked: float
    gross_earned: float
    platform_deductions: float = 0
    net_received: float
    city: Optional[str] = None
    zone: Optional[str] = None
    category: Optional[str] = "ride_hailing"
    notes: Optional[str] = None


class ShiftLogUpdate(BaseModel):
    platform: Optional[str] = None
    date: Optional[date] = None
    hours_worked: Optional[float] = None
    gross_earned: Optional[float] = None
    platform_deductions: Optional[float] = None
    net_received: Optional[float] = None
    city: Optional[str] = None
    zone: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None


class VerificationUpdate(BaseModel):
    verification_status: VerificationStatus
    verification_notes: Optional[str] = None


# ---- Response Schemas ----

class ShiftLogResponse(BaseModel):
    id: int
    worker_id: int
    platform: str
    date: date
    hours_worked: float
    gross_earned: float
    platform_deductions: float
    net_received: float
    city: Optional[str] = None
    zone: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    screenshot_url: Optional[str] = None
    verification_status: str
    verified_by: Optional[int] = None
    verification_notes: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EarningsSummary(BaseModel):
    total_gross: float
    total_deductions: float
    total_net: float
    total_hours: float
    shift_count: int
    avg_hourly_rate: float
    avg_commission_rate: float
    verified_count: int
    pending_count: int


class CityMedian(BaseModel):
    city: str
    category: str
    median_hourly_rate: float
    median_net_daily: float
    worker_count: int


class MessageResponse(BaseModel):
    message: str
    count: Optional[int] = None
