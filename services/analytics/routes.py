import os
import statistics
from collections import defaultdict
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, Request
import httpx
from schemas import (
    PlatformCommissionTrend, IncomeDistribution,
    VulnerableWorker, AdvocateDashboard, PlatformOverview,
)
from auth_utils import require_advocate
from dotenv import load_dotenv

load_dotenv()

EARNINGS_SERVICE_URL = os.getenv("EARNINGS_SERVICE_URL", "http://localhost:8002")

router = APIRouter()

async def fetch_shifts(request: Request):
    """Helper to fetch all shifts from Earnings service via API."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{EARNINGS_SERVICE_URL}/api/earnings/shifts?limit=1000",
                headers={"Authorization": auth_header}
            )
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Earnings API unavailable: {str(exc)}")
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=exc.response.status_code, detail="Failed to fetch earnings data")

@router.get("/dashboard", response_model=AdvocateDashboard)
async def get_advocate_dashboard(
    request: Request,
    user: dict = Depends(require_advocate),
):
    shifts = await fetch_shifts(request)
    
    total_shifts = len(shifts)
    workers_set = set(s.get("worker_id") for s in shifts)
    total_workers = len(workers_set)
    platforms_set = set(s.get("platform") for s in shifts)
    total_platforms = len(platforms_set)
    
    # Avg commission rate
    gross_sum = 0
    deduction_sum = 0
    for s in shifts:
        if s.get("gross_earned", 0) > 0:
            gross_sum += s.get("gross_earned")
            deduction_sum += s.get("platform_deductions", 0)
    
    avg_commission = round((deduction_sum * 100.0 / gross_sum), 2) if gross_sum > 0 else 0.0

    # Commission Trends
    trends_map = defaultdict(list)
    for s in shifts:
        if s.get("gross_earned", 0) > 0:
            month = s.get("date")[:7]
            platform = s.get("platform")
            rate = s.get("platform_deductions", 0) * 100.0 / s.get("gross_earned", 0)
            trends_map[(platform, month)].append(rate)
            
    commission_trends = []
    for (plat, month), rates in trends_map.items():
        commission_trends.append(PlatformCommissionTrend(
            platform=plat,
            month=month,
            avg_commission_rate=round(statistics.mean(rates), 2),
            min_commission_rate=round(min(rates), 2),
            max_commission_rate=round(max(rates), 2),
            shift_count=len(rates)
        ))
    commission_trends.sort(key=lambda x: x.month, reverse=True)
    
    # Income distribution by city
    city_cat_map = defaultdict(list)
    for s in shifts:
        city = s.get("city")
        cat = s.get("category", "N/A")
        if city:
            city_cat_map[(city, cat)].append(s.get("net_received", 0))

    income_distributions = []
    for (city, cat), nets in city_cat_map.items():
        if nets:
            income_distributions.append(IncomeDistribution(
                city=city,
                category=cat,
                avg_net_daily=round(statistics.mean(nets), 2),
                median_net_daily=round(statistics.median(nets), 2),
                min_net_daily=round(min(nets), 2),
                max_net_daily=round(max(nets), 2),
                worker_count=len(set(s.get("worker_id") for s in shifts if s.get("city") == city and s.get("category") == cat))
            ))

    # Vulnerability (income drops > 20%)
    worker_monthly = defaultdict(lambda: defaultdict(float))
    worker_platform = defaultdict(str)
    worker_city = defaultdict(str)
    
    for s in shifts:
        wid = s.get("worker_id")
        month = s.get("date")[:7]
        worker_monthly[wid][month] += s.get("net_received", 0)
        worker_platform[wid] = s.get("platform")
        worker_city[wid] = s.get("city")

    vulnerable_workers = []
    for wid, months_data in worker_monthly.items():
        sorted_months = sorted(months_data.keys())
        for i in range(1, len(sorted_months)):
            prev_m = sorted_months[i-1]
            curr_m = sorted_months[i]
            prev = months_data[prev_m]
            curr = months_data[curr_m]
            
            if prev > 0:
                drop = ((curr - prev) / prev) * 100
                if drop < -20:
                    vulnerable_workers.append(VulnerableWorker(
                        worker_id=wid,
                        prev_month=prev_m,
                        curr_month=curr_m,
                        prev_income=round(prev, 2),
                        curr_income=round(curr, 2),
                        drop_percentage=round(abs(drop), 2),
                        platform=worker_platform[wid],
                        city=worker_city[wid],
                    ))

    vulnerable_workers.sort(key=lambda x: x.drop_percentage, reverse=True)

    return AdvocateDashboard(
        total_workers=total_workers,
        total_shifts=total_shifts,
        total_platforms=total_platforms,
        avg_commission_rate=avg_commission,
        commission_trends=commission_trends,
        income_distributions=income_distributions,
        vulnerable_workers=vulnerable_workers[:20],
        top_complaint_categories=[]
    )

@router.get("/platforms", response_model=List[PlatformOverview])
async def get_platform_overview(
    request: Request,
    user: dict = Depends(require_advocate),
):
    shifts = await fetch_shifts(request)
    
    stats = defaultdict(lambda: {"workers": set(), "shifts": 0, "gross": 0, "deductions": 0, "net": 0, "hours": 0})
    for s in shifts:
        plat = s.get("platform")
        stats[plat]["workers"].add(s.get("worker_id"))
        stats[plat]["shifts"] += 1
        stats[plat]["gross"] += s.get("gross_earned", 0)
        stats[plat]["deductions"] += s.get("platform_deductions", 0)
        stats[plat]["net"] += s.get("net_received", 0)
        stats[plat]["hours"] += s.get("hours_worked", 0)
        
    result = []
    for plat, data in stats.items():
        avg_comm = (data["deductions"] * 100 / data["gross"]) if data["gross"] > 0 else 0
        avg_hr = (data["net"] / data["hours"]) if data["hours"] > 0 else 0
        result.append(PlatformOverview(
            platform=plat,
            worker_count=len(data["workers"]),
            total_shifts=data["shifts"],
            avg_commission_rate=round(avg_comm, 2),
            avg_hourly_rate=round(avg_hr, 2),
            total_complaints=0
        ))
    return result

@router.get("/income-trends")
async def get_income_trends(
    request: Request,
    platform: Optional[str] = None,
    city: Optional[str] = None,
    months: int = Query(6, le=24),
    user: dict = Depends(require_advocate),
):
    shifts = await fetch_shifts(request)
    
    month_data = defaultdict(lambda: {"net": [], "hours": [], "workers": set()})
    
    for s in shifts:
        if platform and s.get("platform") != platform:
            continue
        if city and s.get("city") != city:
            continue
            
        month = s.get("date")[:7]
        month_data[month]["net"].append(s.get("net_received", 0))
        month_data[month]["hours"].append(s.get("hours_worked", 0))
        month_data[month]["workers"].add(s.get("worker_id"))
        
    sorted_months = sorted(month_data.keys(), reverse=True)[:months]
    
    result = []
    for m in sorted_months:
        data = month_data[m]
        total_net = sum(data["net"])
        total_hrs = sum(data["hours"])
        avg_net = total_net / len(data["net"]) if data["net"] else 0
        avg_hr = total_net / total_hrs if total_hrs > 0 else 0
        
        result.append({
            "month": m,
            "avg_net_daily": round(avg_net, 2),
            "avg_hourly_rate": round(avg_hr, 2),
            "active_workers": len(data["workers"]),
            "total_shifts": len(data["net"]),
        })
        
    return result
