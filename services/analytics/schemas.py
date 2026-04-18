from pydantic import BaseModel
from typing import List, Optional


class PlatformCommissionTrend(BaseModel):
    platform: str
    month: str
    avg_commission_rate: float
    min_commission_rate: float
    max_commission_rate: float
    shift_count: int


class IncomeDistribution(BaseModel):
    city: str
    zone: Optional[str] = None
    category: str
    avg_net_daily: float
    median_net_daily: float
    min_net_daily: float
    max_net_daily: float
    worker_count: int


class VulnerableWorker(BaseModel):
    worker_id: int
    prev_month: str
    curr_month: str
    prev_income: float
    curr_income: float
    drop_percentage: float
    platform: Optional[str] = None
    city: Optional[str] = None


class TopComplaintCategory(BaseModel):
    category: str
    count: int
    percentage: float


class AdvocateDashboard(BaseModel):
    total_workers: int
    total_shifts: int
    total_platforms: int
    avg_commission_rate: float
    commission_trends: List[PlatformCommissionTrend]
    income_distributions: List[IncomeDistribution]
    vulnerable_workers: List[VulnerableWorker]
    top_complaint_categories: List[TopComplaintCategory]


class PlatformOverview(BaseModel):
    platform: str
    worker_count: int
    total_shifts: int
    avg_commission_rate: float
    avg_hourly_rate: float
    total_complaints: int
