"""
FairGig Anomaly Detection Engine
================================
Statistical and Rule-Based anomaly detection for gig worker earnings.

Architecture:
1. LAYER 1: Rule-Based Engine (Mandatory, 1+ records)
2. LAYER 2: Statistical Engine (4+ records)
3. LAYER 3: Temporal Analysis (Month-over-month)
"""

import statistics
from typing import List
from datetime import date
from collections import defaultdict
from schemas import EarningsRecord, AnomalyFlag


def calculate_z_score(value: float, values: List[float]) -> float:
    if len(values) < 3: return 0.0
    mean = statistics.mean(values)
    stdev = statistics.stdev(values)
    if stdev == 0: return 0.0
    return (value - mean) / stdev


def calculate_iqr_bounds(values: List[float]) -> tuple:
    if len(values) < 4: return (min(values), max(values))
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    q1 = sorted_vals[n // 4]
    q3 = sorted_vals[3 * n // 4]
    iqr = q3 - q1
    return (q1 - 1.5 * iqr, q3 + 1.5 * iqr)


def detect_anomalies(records: List[EarningsRecord]) -> List[AnomalyFlag]:
    anomalies = []
    if not records:
        return anomalies

    sorted_records = sorted(records, key=lambda r: r.date)
    
    # Pre-compute metrics to avoid zero division
    commission_rates = [
        (r.platform_deductions / r.gross_earned * 100) if r.gross_earned > 0 else 0
        for r in sorted_records
    ]
    hourly_rates = [
        (r.net_received / r.hours_worked) if r.hours_worked > 0 else 0
        for r in sorted_records
    ]
    
    # Fallback expected hourly rate threshold for Layer 1
    MIN_EXPECTED_HOURLY = 250.0  # Minimum acceptable PKR per hour

    # =========================================================
    # LAYER 1: RULE-BASED ENGINE (Must trigger on any dataset sum)
    # =========================================================
    for i, record in enumerate(sorted_records):
        # 1. Extreme Deduction (Deduction > 40%)
        rate = commission_rates[i]
        if rate > 40.0:
            anomalies.append(AnomalyFlag(
                type="extreme_deduction",
                severity="high",
                date=str(record.date),
                metric="Commission Rate (Rule)",
                expected_range="< 40.0%",
                actual_value=f"{rate:.1f}%",
                explanation=(
                    f"On {record.date}, {record.platform} deducted {rate:.1f}% "
                    f"(PKR {record.platform_deductions:,.0f} out of PKR {record.gross_earned:,.0f}). "
                    f"Any deduction over 40% is flagged as a high-severity anomaly regardless of your history."
                )
            ))

        # 2. Low Efficiency / Hourly Rate
        hr_rate = hourly_rates[i]
        if hr_rate > 0 and hr_rate < MIN_EXPECTED_HOURLY:
            anomalies.append(AnomalyFlag(
                type="low_hourly_rate",
                severity="medium",
                date=str(record.date),
                metric="Hourly Rate (Rule)",
                expected_range=f"> PKR {MIN_EXPECTED_HOURLY:.0f}/hr",
                actual_value=f"PKR {hr_rate:.0f}/hr",
                explanation=(
                    f"On {record.date}, your hourly pay on {record.platform} dropped to PKR {hr_rate:.0f}/hr, "
                    f"which is below the minimum fair threshold of PKR {MIN_EXPECTED_HOURLY:.0f}/hr."
                )
            ))

        # 3. Sudden Shift-to-Shift Income Drop (> 20%)
        if i > 0:
            prev_net = sorted_records[i-1].net_received
            curr_net = record.net_received
            if prev_net > 0 and curr_net < (prev_net * 0.8):
                drop_pct = ((prev_net - curr_net) / prev_net) * 100
                # Ensure hours didn't drop drastically to explain the income drop
                if record.hours_worked >= sorted_records[i-1].hours_worked * 0.8:
                    anomalies.append(AnomalyFlag(
                        type="shift_income_drop",
                        severity="high" if drop_pct > 40 else "medium",
                        date=str(record.date),
                        metric="Shift Net Income (Rule)",
                        expected_range=f"> PKR {prev_net * 0.8:,.0f}",
                        actual_value=f"PKR {curr_net:,.0f} (-{drop_pct:.1f}%)",
                        explanation=(
                            f"Your earnings on {record.date} were PKR {curr_net:,.0f}, a sudden drop "
                            f"of {drop_pct:.1f}% compared to your previous shift, despite working similar hours."
                        )
                    ))

    # =========================================================
    # LAYER 2: STATISTICAL ENGINE (Only for 4+ records)
    # =========================================================
    if len(sorted_records) >= 4:
        valid_hourly = [r for r in hourly_rates if r > 0]
        
        # Z-Score for Unusual Deductions
        mean_commission = statistics.mean(commission_rates)
        for i, record in enumerate(sorted_records):
            z = calculate_z_score(commission_rates[i], commission_rates)
            # Prevent double-flagging if Layer 1 already caught it (> 40%)
            if abs(z) > 2.0 and commission_rates[i] > mean_commission and commission_rates[i] <= 40.0:
                anomalies.append(AnomalyFlag(
                    type="statistical_high_deduction",
                    severity="medium",
                    date=str(record.date),
                    metric="Commission Rate (Z-Score)",
                    expected_range=f"{mean_commission:.1f}% ± {statistics.stdev(commission_rates):.1f}%",
                    actual_value=f"{commission_rates[i]:.1f}%",
                    explanation=(
                        f"Based on your history, the {commission_rates[i]:.1f}% deduction on {record.date} "
                        f"is a statistical outlier (Z > 2.0). Your usual rate is ~{mean_commission:.1f}%."
                    )
                ))

        # IQR for Hourly Rates
        if len(valid_hourly) >= 4:
            lower_bound, upper_bound = calculate_iqr_bounds(valid_hourly)
            for i, record in enumerate(sorted_records):
                # Avoid double flagging Layer 1 low hourly rate
                if 0 < hourly_rates[i] < lower_bound and hourly_rates[i] >= MIN_EXPECTED_HOURLY:
                    anomalies.append(AnomalyFlag(
                        type="iqr_low_hourly",
                        severity="low",
                        date=str(record.date),
                        metric="Hourly Rate (IQR)",
                        expected_range=f"> PKR {lower_bound:,.0f}/hr",
                        actual_value=f"PKR {hourly_rates[i]:,.0f}/hr",
                        explanation=(
                            f"Your hourly pay of PKR {hourly_rates[i]:,.0f}/hr on {record.date} is statistically "
                            f"lower than your usual range (lower bound: PKR {lower_bound:,.0f}/hr)."
                        )
                    ))

    # =========================================================
    # LAYER 3: TEMPORAL ANALYSIS (MONTHLY)
    # =========================================================
    monthly_income = defaultdict(float)
    for record in sorted_records:
        month_key = record.date.strftime("%Y-%m") if isinstance(record.date, date) else str(record.date)[:7]
        monthly_income[month_key] += record.net_received

    months = sorted(monthly_income.keys())
    for i in range(1, len(months)):
        prev_income = monthly_income[months[i - 1]]
        curr_income = monthly_income[months[i]]

        if prev_income > 0:
            change_pct = ((prev_income - curr_income) / prev_income) * 100
            if change_pct > 20: # 20% drop
                severity = "high" if change_pct > 40 else "medium"
                anomalies.append(AnomalyFlag(
                    type="monthly_income_drop",
                    severity=severity,
                    date=months[i],
                    metric="Monthly Net Income",
                    expected_range=f"> PKR {prev_income * 0.8:,.0f}",
                    actual_value=f"PKR {curr_income:,.0f} (-{change_pct:.1f}%)",
                    explanation=(
                        f"Your total net income dropped by {change_pct:.1f}% from {months[i-1]} to {months[i]}. "
                        f"A drop >20% across months is a critical vulnerability signal."
                    )
                ))

    return anomalies


def generate_summary(worker_name: str, records_count: int, anomalies: List[AnomalyFlag]) -> str:
    if not anomalies:
        return (
            f"Good news, {worker_name}! After analyzing {records_count} earnings records, "
            f"no unusual patterns were detected. Your earnings, deductions, and working hours "
            f"all appear consistent and within expected ranges."
        )

    high_count = sum(1 for a in anomalies if a.severity == "high")
    medium_count = sum(1 for a in anomalies if a.severity == "medium")
    
    summary_parts = [
        f"After analyzing {records_count} earnings records for {worker_name}, "
        f"we found {len(anomalies)} potential issue(s):"
    ]

    if high_count > 0:
        summary_parts.append(f"  • {high_count} high-severity concern(s) that need immediate attention")
    if medium_count > 0:
        summary_parts.append(f"  • {medium_count} medium-severity pattern(s) worth reviewing")

    summary_parts.append(
        "\nYour shifts were scanned using our 3-Layer Hybrid Engine (Rule-based, Statistical, and Temporal). "
        "Review the exact flags below to see which rules triggered."
    )

    return "\n".join(summary_parts)


METHODOLOGY = """
FairGig Anomaly Detection Methodology (Hybrid Engine)
===================================================

To ensure robustness on both small (1-3 records) and large datasets, FairGig uses a 3-Layer Engine:

1. **Layer 1: Rule-Based Engine (Immediate Fallback):**
   Runs on every record. Instantly flags egregious changes without requiring history:
   - Commission rates > 40.0%
   - Hourly rates dipping below acceptable thresholds (PKR 250/hr)
   - Shift-to-shift income dropping by >20% on similar hours

2. **Layer 2: Statistical Engine (Requires 4+ records):**
   Activates once enough baseline data is present.
   - **Z-Score Analysis**: Identifies statistical outliers beyond Z=2.0
   - **IQR (Interquartile Range)**: Finds hourly rate outliers robustly

3. **Layer 3: Temporal Analysis (Monthly):**
   Compares total aggregate income month-over-month to flag drops >20%.
"""
