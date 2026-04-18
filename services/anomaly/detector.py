"""
FairGig Anomaly Detection Engine
================================
Statistical anomaly detection for gig worker earnings.

Methods used:
1. Z-Score Analysis — flags values more than 2 standard deviations from mean
2. IQR (Interquartile Range) — flags outliers beyond 1.5×IQR
3. Month-over-Month Change — flags income drops > 20%
4. Commission Rate Analysis — flags deduction rates that deviate from platform norms

All explanations are returned in plain, human-readable language
so a non-technical gig worker can understand what happened.
"""

import statistics
from typing import List
from datetime import date, timedelta
from collections import defaultdict
from schemas import EarningsRecord, AnomalyFlag


def calculate_z_score(value: float, values: List[float]) -> float:
    """Calculate Z-score for a value against a list of values."""
    if len(values) < 3:
        return 0.0
    mean = statistics.mean(values)
    stdev = statistics.stdev(values)
    if stdev == 0:
        return 0.0
    return (value - mean) / stdev


def calculate_iqr_bounds(values: List[float]) -> tuple:
    """Calculate IQR lower and upper bounds."""
    if len(values) < 4:
        return (min(values), max(values))
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    q1 = sorted_vals[n // 4]
    q3 = sorted_vals[3 * n // 4]
    iqr = q3 - q1
    return (q1 - 1.5 * iqr, q3 + 1.5 * iqr)


def detect_anomalies(records: List[EarningsRecord]) -> List[AnomalyFlag]:
    """
    Run all anomaly detection checks on a worker's earnings history.
    Returns a list of flagged anomalies with plain-language explanations.
    """
    if len(records) < 3:
        return []

    anomalies = []

    # Sort by date
    sorted_records = sorted(records, key=lambda r: r.date)

    # Extract key metrics
    net_earnings = [r.net_received for r in sorted_records]
    gross_earnings = [r.gross_earned for r in sorted_records]
    deductions = [r.platform_deductions for r in sorted_records]
    hours = [r.hours_worked for r in sorted_records]
    commission_rates = [
        (r.platform_deductions / r.gross_earned * 100) if r.gross_earned > 0 else 0
        for r in sorted_records
    ]
    hourly_rates = [
        (r.net_received / r.hours_worked) if r.hours_worked > 0 else 0
        for r in sorted_records
    ]

    # ── Check 1: Unusual Deductions (Z-Score) ──
    if len(commission_rates) >= 3:
        mean_commission = statistics.mean(commission_rates)
        for i, record in enumerate(sorted_records):
            z = calculate_z_score(commission_rates[i], commission_rates)
            if abs(z) > 2.0 and commission_rates[i] > mean_commission:
                severity = "high" if z > 3 else "medium"
                anomalies.append(AnomalyFlag(
                    type="high_deduction",
                    severity=severity,
                    date=str(record.date),
                    metric="Commission Rate",
                    expected_range=f"{mean_commission:.1f}% ± {statistics.stdev(commission_rates):.1f}%",
                    actual_value=f"{commission_rates[i]:.1f}%",
                    explanation=(
                        f"On {record.date}, {record.platform} deducted {commission_rates[i]:.1f}% "
                        f"of your gross earnings (PKR {record.platform_deductions:,.0f} out of "
                        f"PKR {record.gross_earned:,.0f}). Your usual commission rate is around "
                        f"{mean_commission:.1f}%. This is unusually high and may indicate "
                        f"a platform fee change or billing error."
                    ),
                ))

    # ── Check 2: Sudden Income Drops (Month-over-Month) ──
    monthly_income = defaultdict(float)
    for record in sorted_records:
        month_key = record.date.strftime("%Y-%m") if isinstance(record.date, date) else str(record.date)[:7]
        monthly_income[month_key] += record.net_received

    months = sorted(monthly_income.keys())
    for i in range(1, len(months)):
        prev_income = monthly_income[months[i - 1]]
        curr_income = monthly_income[months[i]]

        if prev_income > 0:
            change_pct = ((curr_income - prev_income) / prev_income) * 100

            if change_pct < -20:
                severity = "high" if change_pct < -40 else "medium"
                anomalies.append(AnomalyFlag(
                    type="income_drop",
                    severity=severity,
                    date=months[i],
                    metric="Monthly Net Income",
                    expected_range=f"PKR {prev_income:,.0f} (previous month)",
                    actual_value=f"PKR {curr_income:,.0f} ({change_pct:+.1f}%)",
                    explanation=(
                        f"Your net income in {months[i]} was PKR {curr_income:,.0f}, "
                        f"which is {abs(change_pct):.1f}% lower than the previous month "
                        f"(PKR {prev_income:,.0f}). A drop of more than 20% may indicate "
                        f"reduced hours, platform algorithm changes, or zone reassignment. "
                        f"If you did not reduce your working hours, this warrants investigation."
                    ),
                ))

    # ── Check 3: Unusually Low Hourly Rate (IQR) ──
    valid_hourly = [r for r in hourly_rates if r > 0]
    if len(valid_hourly) >= 4:
        lower_bound, upper_bound = calculate_iqr_bounds(valid_hourly)
        median_rate = statistics.median(valid_hourly)

        for i, record in enumerate(sorted_records):
            if hourly_rates[i] > 0 and hourly_rates[i] < lower_bound:
                anomalies.append(AnomalyFlag(
                    type="low_hourly_rate",
                    severity="medium",
                    date=str(record.date),
                    metric="Effective Hourly Rate",
                    expected_range=f"PKR {lower_bound:,.0f} – {upper_bound:,.0f}/hr",
                    actual_value=f"PKR {hourly_rates[i]:,.0f}/hr",
                    explanation=(
                        f"On {record.date}, your effective hourly rate on {record.platform} "
                        f"was PKR {hourly_rates[i]:,.0f}/hr, well below your usual range of "
                        f"PKR {lower_bound:,.0f}–{upper_bound:,.0f}/hr (median: PKR {median_rate:,.0f}/hr). "
                        f"This could mean higher wait times, shorter trips, or increased deductions."
                    ),
                ))

    # ── Check 4: Unusual Working Hours ──
    if len(hours) >= 3:
        mean_hours = statistics.mean(hours)
        for i, record in enumerate(sorted_records):
            z = calculate_z_score(record.hours_worked, hours)
            if z > 2.5 and record.hours_worked > mean_hours:
                anomalies.append(AnomalyFlag(
                    type="unusual_hours",
                    severity="low",
                    date=str(record.date),
                    metric="Hours Worked",
                    expected_range=f"{mean_hours:.1f} hrs (avg)",
                    actual_value=f"{record.hours_worked:.1f} hrs",
                    explanation=(
                        f"On {record.date}, you logged {record.hours_worked:.1f} hours on "
                        f"{record.platform}, significantly more than your average of "
                        f"{mean_hours:.1f} hours. While this may be intentional, extremely "
                        f"long shifts can affect safety and earnings efficiency."
                    ),
                ))

    # ── Check 5: Platform Commission Rate Changes ──
    platform_rates = defaultdict(list)
    for i, record in enumerate(sorted_records):
        platform_rates[record.platform].append((record.date, commission_rates[i]))

    for platform, rates in platform_rates.items():
        if len(rates) >= 5:
            # Check if recent rates are higher than historical
            historical = [r[1] for r in rates[:-3]]
            recent = [r[1] for r in rates[-3:]]

            if historical and recent:
                hist_avg = statistics.mean(historical)
                recent_avg = statistics.mean(recent)

                if recent_avg > hist_avg * 1.15:  # 15% increase
                    anomalies.append(AnomalyFlag(
                        type="rate_change",
                        severity="high",
                        date=str(rates[-1][0]),
                        metric=f"{platform} Commission Rate Trend",
                        expected_range=f"{hist_avg:.1f}% (historical avg)",
                        actual_value=f"{recent_avg:.1f}% (recent avg)",
                        explanation=(
                            f"{platform} appears to have increased commission rates. "
                            f"Your historical average was {hist_avg:.1f}%, but recent shifts "
                            f"show an average of {recent_avg:.1f}%. This {recent_avg - hist_avg:.1f}% "
                            f"increase reduces your take-home pay. Other workers on the platform may "
                            f"be experiencing similar changes."
                        ),
                    ))

    return anomalies


def generate_summary(worker_name: str, records_count: int, anomalies: List[AnomalyFlag]) -> str:
    """Generate a plain-language summary of all findings."""
    if not anomalies:
        return (
            f"Good news, {worker_name}! After analyzing {records_count} earnings records, "
            f"no unusual patterns were detected. Your earnings, deductions, and working hours "
            f"all appear consistent and within expected ranges."
        )

    high_count = sum(1 for a in anomalies if a.severity == "high")
    medium_count = sum(1 for a in anomalies if a.severity == "medium")
    types = set(a.type for a in anomalies)

    summary_parts = [
        f"After analyzing {records_count} earnings records for {worker_name}, "
        f"we found {len(anomalies)} potential issue(s):"
    ]

    if high_count > 0:
        summary_parts.append(f"  • {high_count} high-severity concern(s) that need immediate attention")
    if medium_count > 0:
        summary_parts.append(f"  • {medium_count} medium-severity pattern(s) worth reviewing")

    if "income_drop" in types:
        summary_parts.append("  • Significant income drops were detected month-over-month")
    if "high_deduction" in types:
        summary_parts.append("  • Some platform deductions appear unusually high")
    if "rate_change" in types:
        summary_parts.append("  • Platform commission rates may have changed recently")

    summary_parts.append(
        "\nWe recommend reviewing the detailed flags below and comparing with "
        "fellow workers on the community board to see if these patterns are widespread."
    )

    return "\n".join(summary_parts)


METHODOLOGY = """
FairGig Anomaly Detection Methodology
======================================

This service uses statistical methods to flag unusual patterns in gig worker earnings:

1. **Z-Score Analysis**: Identifies values more than 2 standard deviations from the worker's
   historical mean. Used for commission rate and working hours analysis.

2. **IQR (Interquartile Range)**: Identifies outliers beyond 1.5× the interquartile range.
   More robust against extreme values. Used for hourly rate analysis.

3. **Month-over-Month Comparison**: Flags monthly income drops exceeding 20%, which may
   indicate platform changes, algorithm shifts, or account issues.

4. **Platform Rate Trend Detection**: Compares recent commission rates against historical
   averages per platform to detect systematic rate increases.

Limitations:
- Requires at least 3 records for basic analysis, 5+ for trend detection
- Cannot distinguish between worker-initiated changes (e.g., fewer hours) and platform issues
- Seasonal variations may trigger false positives
- All flags are statistical suggestions, not definitive proof of unfairness
"""
