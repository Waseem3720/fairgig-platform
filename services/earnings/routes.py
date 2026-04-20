import io
import csv
import os
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
import cloudinary
import cloudinary.uploader
from database import get_db
from models import ShiftLog, VerificationStatus
from schemas import (
    ShiftLogCreate, ShiftLogUpdate, VerificationUpdate,
    ShiftLogResponse, EarningsSummary, CityMedian, MessageResponse,
)
from auth_utils import get_current_user_id, get_current_user_role, require_role
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

router = APIRouter()


# ──────────────────────────────────────────────
# CRUD — Shift Logs
# ──────────────────────────────────────────────
@router.post("/shifts", response_model=ShiftLogResponse, status_code=201)
def create_shift(
    payload: ShiftLogCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Log a new shift/earnings record."""
    shift = ShiftLog(
        worker_id=user_id,
        platform=payload.platform,
        date=payload.date,
        hours_worked=payload.hours_worked,
        gross_earned=payload.gross_earned,
        platform_deductions=payload.platform_deductions,
        net_received=payload.net_received,
        city=payload.city,
        zone=payload.zone,
        category=payload.category,
        notes=payload.notes,
        verification_status=VerificationStatus.pending,
    )
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return ShiftLogResponse.model_validate(shift)


@router.get("/shifts", response_model=List[ShiftLogResponse])
def list_shifts(
    platform: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    verification_status: Optional[str] = None,
    worker_id: Optional[int] = None,
    limit: int = Query(100, le=500),
    offset: int = 0,
    user: dict = Depends(get_current_user_role),
    db: Session = Depends(get_db),
):
    """List shift logs. Workers see own shifts; verifiers/advocates see all or filtered."""
    query = db.query(ShiftLog)

    # Workers can only see their own shifts
    if user["role"] == "worker":
        query = query.filter(ShiftLog.worker_id == user["id"])
    elif worker_id:
        query = query.filter(ShiftLog.worker_id == worker_id)

    if platform:
        query = query.filter(ShiftLog.platform == platform)
    if start_date:
        query = query.filter(ShiftLog.date >= start_date)
    if end_date:
        query = query.filter(ShiftLog.date <= end_date)
    if verification_status:
        query = query.filter(ShiftLog.verification_status == verification_status)

    query = query.order_by(ShiftLog.date.desc())
    shifts = query.offset(offset).limit(limit).all()
    return [ShiftLogResponse.model_validate(s) for s in shifts]


@router.get("/shifts/{shift_id}", response_model=ShiftLogResponse)
def get_shift(
    shift_id: int,
    user: dict = Depends(get_current_user_role),
    db: Session = Depends(get_db),
):
    """Get a single shift log by ID."""
    shift = db.query(ShiftLog).filter(ShiftLog.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    if user["role"] == "worker" and shift.worker_id != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return ShiftLogResponse.model_validate(shift)


@router.put("/shifts/{shift_id}", response_model=ShiftLogResponse)
def update_shift(
    shift_id: int,
    payload: ShiftLogUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Update a shift log (worker can only update own unverified shifts)."""
    shift = db.query(ShiftLog).filter(ShiftLog.id == shift_id, ShiftLog.worker_id == user_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    if shift.verification_status == VerificationStatus.verified:
        raise HTTPException(status_code=400, detail="Cannot edit a verified shift")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(shift, field, value)

    db.commit()
    db.refresh(shift)
    return ShiftLogResponse.model_validate(shift)


@router.delete("/shifts/{shift_id}", response_model=MessageResponse)
def delete_shift(
    shift_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Delete a shift log."""
    shift = db.query(ShiftLog).filter(ShiftLog.id == shift_id, ShiftLog.worker_id == user_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    db.delete(shift)
    db.commit()
    return MessageResponse(message="Shift deleted successfully")


# ──────────────────────────────────────────────
# CSV Import
# ──────────────────────────────────────────────
@router.post("/shifts/import-csv", response_model=MessageResponse)
async def import_csv(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Bulk import shift logs from CSV file.
    Expected columns: platform, date, hours_worked, gross_earned, platform_deductions, net_received, city, zone, category
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))

    count = 0
    for row in reader:
        try:
            shift = ShiftLog(
                worker_id=user_id,
                platform=row.get("platform", "Unknown"),
                date=row.get("date"),
                hours_worked=float(row.get("hours_worked", 0)),
                gross_earned=float(row.get("gross_earned", 0)),
                platform_deductions=float(row.get("platform_deductions", 0)),
                net_received=float(row.get("net_received", 0)),
                city=row.get("city"),
                zone=row.get("zone"),
                category=row.get("category", "ride_hailing"),
                verification_status=VerificationStatus.pending,
            )
            db.add(shift)
            count += 1
        except (ValueError, KeyError):
            continue

    db.commit()
    return MessageResponse(message=f"Successfully imported {count} shifts", count=count)


# ──────────────────────────────────────────────
# Screenshot Upload
# ──────────────────────────────────────────────
@router.post("/shifts/{shift_id}/screenshot", response_model=ShiftLogResponse)
async def upload_screenshot(
    shift_id: int,
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Upload an earnings screenshot for verification via Cloudinary."""
    shift = db.query(ShiftLog).filter(ShiftLog.id == shift_id, ShiftLog.worker_id == user_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    try:
        content = await file.read()
        result = cloudinary.uploader.upload(content, folder="fairgig_screenshots")
        shift.screenshot_url = result.get("secure_url")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

    shift.verification_status = VerificationStatus.pending
    db.commit()
    db.refresh(shift)
    return ShiftLogResponse.model_validate(shift)


# ──────────────────────────────────────────────
# Verification (Verifier role)
# ──────────────────────────────────────────────
@router.get("/verification/pending", response_model=List[ShiftLogResponse])
def get_pending_verifications(
    user: dict = Depends(require_role("verifier", "advocate")),
    db: Session = Depends(get_db),
):
    """Get all shifts pending verification (with or without screenshots)."""
    shifts = db.query(ShiftLog).filter(
        ShiftLog.verification_status == VerificationStatus.pending,
    ).order_by(ShiftLog.created_at.desc()).all()
    return [ShiftLogResponse.model_validate(s) for s in shifts]


@router.put("/verification/{shift_id}", response_model=ShiftLogResponse)
def verify_shift(
    shift_id: int,
    payload: VerificationUpdate,
    user: dict = Depends(require_role("verifier", "advocate")),
    db: Session = Depends(get_db),
):
    """Verify, dispute, or mark a shift as unverifiable."""
    shift = db.query(ShiftLog).filter(ShiftLog.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    shift.verification_status = payload.verification_status
    shift.verification_notes = payload.verification_notes
    shift.verified_by = user["id"]
    shift.verified_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(shift)
    return ShiftLogResponse.model_validate(shift)


# ──────────────────────────────────────────────
# Worker Earnings Summary
# ──────────────────────────────────────────────
@router.get("/summary", response_model=EarningsSummary)
def get_earnings_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    platform: Optional[str] = None,
    worker_id: Optional[int] = None,
    user: dict = Depends(get_current_user_role),
    db: Session = Depends(get_db),
):
    """Get earnings summary for a worker."""
    target_id = user["id"] if user["role"] == "worker" else (worker_id or user["id"])

    query = db.query(ShiftLog).filter(ShiftLog.worker_id == target_id)
    if start_date:
        query = query.filter(ShiftLog.date >= start_date)
    if end_date:
        query = query.filter(ShiftLog.date <= end_date)
    if platform:
        query = query.filter(ShiftLog.platform == platform)

    shifts = query.all()

    if not shifts:
        return EarningsSummary(
            total_gross=0, total_deductions=0, total_net=0,
            total_hours=0, shift_count=0, avg_hourly_rate=0,
            avg_commission_rate=0, verified_count=0, pending_count=0,
        )

    total_gross = sum(s.gross_earned for s in shifts)
    total_deductions = sum(s.platform_deductions for s in shifts)
    total_net = sum(s.net_received for s in shifts)
    total_hours = sum(s.hours_worked for s in shifts)
    verified = sum(1 for s in shifts if s.verification_status == VerificationStatus.verified)
    pending = sum(1 for s in shifts if s.verification_status == VerificationStatus.pending)

    return EarningsSummary(
        total_gross=round(total_gross, 2),
        total_deductions=round(total_deductions, 2),
        total_net=round(total_net, 2),
        total_hours=round(total_hours, 2),
        shift_count=len(shifts),
        avg_hourly_rate=round(total_net / total_hours, 2) if total_hours > 0 else 0,
        avg_commission_rate=round((total_deductions / total_gross) * 100, 2) if total_gross > 0 else 0,
        verified_count=verified,
        pending_count=pending,
    )


# ──────────────────────────────────────────────
# City-wide Median (anonymised aggregate)
# ──────────────────────────────────────────────
@router.get("/city-median", response_model=List[CityMedian])
def get_city_median(
    city: Optional[str] = None,
    category: Optional[str] = None,
    user: dict = Depends(get_current_user_role),
    db: Session = Depends(get_db),
):
    """Get anonymised city-wide median earnings for comparison.
    Returns aggregate stats only — never exposes individual worker data."""
    query = db.query(
        ShiftLog.city,
        ShiftLog.category,
        func.count(func.distinct(ShiftLog.worker_id)).label("worker_count"),
    ).filter(ShiftLog.city.isnot(None))

    if city:
        query = query.filter(ShiftLog.city == city)
    if category:
        query = query.filter(ShiftLog.category == category)

    groups = query.group_by(ShiftLog.city, ShiftLog.category).all()

    results = []
    for group in groups:
        # Calculate median hourly rate for this city+category
        shifts = db.query(ShiftLog).filter(
            ShiftLog.city == group.city,
            ShiftLog.category == group.category,
            ShiftLog.hours_worked > 0,
        ).all()

        hourly_rates = sorted([s.net_received / s.hours_worked for s in shifts if s.hours_worked > 0])
        daily_nets = sorted([s.net_received for s in shifts])

        median_hourly = hourly_rates[len(hourly_rates) // 2] if hourly_rates else 0
        median_daily = daily_nets[len(daily_nets) // 2] if daily_nets else 0

        results.append(CityMedian(
            city=group.city,
            category=group.category,
            median_hourly_rate=round(median_hourly, 2),
            median_net_daily=round(median_daily, 2),
            worker_count=group.worker_count,
        ))

    return results


# ──────────────────────────────────────────────
# Worker earnings history (for anomaly service)
# ──────────────────────────────────────────────
@router.get("/history/{worker_id}", response_model=List[ShiftLogResponse])
def get_worker_history(
    worker_id: int,
    limit: int = Query(90, le=365),
    user: dict = Depends(get_current_user_role),
    db: Session = Depends(get_db),
):
    """Get a worker's earnings history. Used by anomaly service."""
    if user["role"] == "worker" and user["id"] != worker_id:
        raise HTTPException(status_code=403, detail="Access denied")

    shifts = db.query(ShiftLog).filter(
        ShiftLog.worker_id == worker_id
    ).order_by(ShiftLog.date.desc()).limit(limit).all()

    return [ShiftLogResponse.model_validate(s) for s in shifts]
