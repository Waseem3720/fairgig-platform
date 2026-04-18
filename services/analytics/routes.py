import statistics
from collections import defaultdict
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_earnings_db
from schemas import (
    PlatformCommissionTrend, IncomeDistribution,
    VulnerableWorker, AdvocateDashboard, PlatformOverview,
)
from auth_utils import require_advocate

router = APIRouter()


@router.get("/dashboard", response_model=AdvocateDashboard)
def get_advocate_dashboard(
    user: dict = Depends(require_advocate),
    db: Session = Depends(get_earnings_db),
):
    """
    Advocate analytics dashboard — aggregate KPIs.
    - Platform commission trends over time
    - Income distribution by city zone
    - Workers with >20% income drop (vulnerability flags)
    """

    # Basic stats
    total_workers = db.execute(text("SELECT COUNT(DISTINCT worker_id) FROM shift_logs")).scalar() or 0
    total_shifts = db.execute(text("SELECT COUNT(*) FROM shift_logs")).scalar() or 0
    total_platforms = db.execute(text("SELECT COUNT(DISTINCT platform) FROM shift_logs")).scalar() or 0

    # Average commission rate
    avg_result = db.execute(text(
        "SELECT AVG(CASE WHEN gross_earned > 0 THEN (platform_deductions * 100.0 / gross_earned) ELSE 0 END) FROM shift_logs"
    )).scalar()
    avg_commission = round(avg_result or 0, 2)

    # Commission trends by platform by month
    trends_rows = db.execute(text("""
        SELECT platform,
               strftime('%Y-%m', date) as month,
               AVG(CASE WHEN gross_earned > 0 THEN platform_deductions * 100.0 / gross_earned ELSE 0 END) as avg_rate,
               MIN(CASE WHEN gross_earned > 0 THEN platform_deductions * 100.0 / gross_earned ELSE 0 END) as min_rate,
               MAX(CASE WHEN gross_earned > 0 THEN platform_deductions * 100.0 / gross_earned ELSE 0 END) as max_rate,
               COUNT(*) as shift_count
        FROM shift_logs
        GROUP BY platform, month
        ORDER BY month DESC, platform
        LIMIT 100
    """)).fetchall()

    commission_trends = [
        PlatformCommissionTrend(
            platform=r[0], month=r[1],
            avg_commission_rate=round(r[2], 2),
            min_commission_rate=round(r[3], 2),
            max_commission_rate=round(r[4], 2),
            shift_count=r[5],
        ) for r in trends_rows
    ]

    # Income distribution by city
    city_rows = db.execute(text("""
        SELECT city, category,
               AVG(net_received) as avg_net,
               MIN(net_received) as min_net,
               MAX(net_received) as max_net,
               COUNT(DISTINCT worker_id) as worker_count
        FROM shift_logs
        WHERE city IS NOT NULL
        GROUP BY city, category
        ORDER BY city
    """)).fetchall()

    income_distributions = []
    for r in city_rows:
        # Calculate median
        nets = db.execute(text(
            "SELECT net_received FROM shift_logs WHERE city = :city AND category = :cat ORDER BY net_received"
        ), {"city": r[0], "cat": r[1]}).fetchall()
        net_values = [n[0] for n in nets]
        median_val = statistics.median(net_values) if net_values else 0

        income_distributions.append(IncomeDistribution(
            city=r[0], category=r[1],
            avg_net_daily=round(r[2], 2),
            median_net_daily=round(median_val, 2),
            min_net_daily=round(r[3], 2),
            max_net_daily=round(r[4], 2),
            worker_count=r[5],
        ))

    # Vulnerability flags — workers with >20% income drop month-over-month
    monthly_rows = db.execute(text("""
        SELECT worker_id, strftime('%Y-%m', date) as month, SUM(net_received) as total_net,
               MAX(platform) as platform, MAX(city) as city
        FROM shift_logs
        GROUP BY worker_id, month
        ORDER BY worker_id, month
    """)).fetchall()

    worker_monthly = defaultdict(list)
    for r in monthly_rows:
        worker_monthly[r[0]].append({
            "month": r[1], "total": r[2], "platform": r[3], "city": r[4]
        })

    vulnerable_workers = []
    for worker_id, months in worker_monthly.items():
        if len(months) >= 2:
            for i in range(1, len(months)):
                prev = months[i - 1]["total"]
                curr = months[i]["total"]
                if prev > 0:
                    drop = ((curr - prev) / prev) * 100
                    if drop < -20:
                        vulnerable_workers.append(VulnerableWorker(
                            worker_id=worker_id,
                            prev_month=months[i - 1]["month"],
                            curr_month=months[i]["month"],
                            prev_income=round(prev, 2),
                            curr_income=round(curr, 2),
                            drop_percentage=round(abs(drop), 2),
                            platform=months[i]["platform"],
                            city=months[i]["city"],
                        ))

    # Sort by drop severity
    vulnerable_workers.sort(key=lambda v: v.drop_percentage, reverse=True)

    return AdvocateDashboard(
        total_workers=total_workers,
        total_shifts=total_shifts,
        total_platforms=total_platforms,
        avg_commission_rate=avg_commission,
        commission_trends=commission_trends,
        income_distributions=income_distributions,
        vulnerable_workers=vulnerable_workers[:20],
        top_complaint_categories=[],  # Filled from grievance service in frontend
    )


@router.get("/platforms", response_model=List[PlatformOverview])
def get_platform_overview(
    user: dict = Depends(require_advocate),
    db: Session = Depends(get_earnings_db),
):
    """Overview stats per platform."""
    rows = db.execute(text("""
        SELECT platform,
               COUNT(DISTINCT worker_id) as workers,
               COUNT(*) as shifts,
               AVG(CASE WHEN gross_earned > 0 THEN platform_deductions * 100.0 / gross_earned ELSE 0 END) as avg_commission,
               AVG(CASE WHEN hours_worked > 0 THEN net_received / hours_worked ELSE 0 END) as avg_hourly
        FROM shift_logs
        GROUP BY platform
        ORDER BY shifts DESC
    """)).fetchall()

    return [
        PlatformOverview(
            platform=r[0], worker_count=r[1], total_shifts=r[2],
            avg_commission_rate=round(r[3], 2),
            avg_hourly_rate=round(r[4], 2),
            total_complaints=0,
        ) for r in rows
    ]


@router.get("/income-trends")
def get_income_trends(
    platform: Optional[str] = None,
    city: Optional[str] = None,
    months: int = Query(6, le=24),
    user: dict = Depends(require_advocate),
    db: Session = Depends(get_earnings_db),
):
    """Monthly income trends across all workers (anonymised aggregate)."""
    query = """
        SELECT strftime('%Y-%m', date) as month,
               AVG(net_received) as avg_net,
               AVG(CASE WHEN hours_worked > 0 THEN net_received / hours_worked ELSE 0 END) as avg_hourly,
               COUNT(DISTINCT worker_id) as active_workers,
               COUNT(*) as total_shifts
        FROM shift_logs
        WHERE 1=1
    """
    params = {}
    if platform:
        query += " AND platform = :platform"
        params["platform"] = platform
    if city:
        query += " AND city = :city"
        params["city"] = city

    query += " GROUP BY month ORDER BY month DESC LIMIT :months"
    params["months"] = months

    rows = db.execute(text(query), params).fetchall()

    return [
        {
            "month": r[0],
            "avg_net_daily": round(r[1], 2),
            "avg_hourly_rate": round(r[2], 2),
            "active_workers": r[3],
            "total_shifts": r[4],
        } for r in rows
    ]
