from pydantic import BaseModel
from typing import List, Optional
from datetime import date


class EarningsRecord(BaseModel):
    """Single earnings record for anomaly analysis."""
    id: Optional[int] = None
    platform: str
    date: date
    hours_worked: float
    gross_earned: float
    platform_deductions: float
    net_received: float
    city: Optional[str] = None
    category: Optional[str] = None


class AnomalyRequest(BaseModel):
    """Request payload for anomaly detection.
    Judges will call this endpoint directly with a crafted payload."""
    worker_name: Optional[str] = "Worker"
    earnings_history: List[EarningsRecord]


class AnomalyFlag(BaseModel):
    """A single detected anomaly."""
    type: str  # "high_deduction", "income_drop", "unusual_hours", "rate_change"
    severity: str  # "low", "medium", "high"
    date: str
    metric: str
    expected_range: str
    actual_value: str
    explanation: str  # Human-readable plain-language explanation


class AnomalyResponse(BaseModel):
    """Response from the anomaly detection service."""
    worker_name: str
    records_analyzed: int
    anomalies_found: int
    anomalies: List[AnomalyFlag]
    summary: str  # Overall plain-language summary
    methodology: str  # How detection works (for transparency)
