# FairGig — Anomaly Detection Service

Statistical anomaly detection for gig worker earnings. Returns flagged anomalies with **plain-language explanations**.

## Tech Stack
- **Python 3.10+**
- **FastAPI** with Uvicorn
- **Pure Python** `statistics` module (no external ML dependencies)

## Quick Start

```bash
cd services/anomaly
pip install -r requirements.txt
python main.py
```

Service runs at **http://localhost:8003**  
API docs at **http://localhost:8003/docs**

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/anomaly/detect` | Detect anomalies in earnings history | No (public) |
| GET | `/api/anomaly/methodology` | View detection methodology | No |

## Detection Methods

| Method | What it Detects | Threshold |
|--------|----------------|-----------|
| Z-Score | Unusual deductions, abnormal hours | > 2σ from mean |
| IQR | Hourly rate outliers | Beyond 1.5×IQR |
| Month-over-Month | Income drops | > 20% decrease |
| Rate Trend | Platform commission increases | > 15% above historical avg |

## Example Request

```bash
curl -X POST http://localhost:8003/api/anomaly/detect \
  -H "Content-Type: application/json" \
  -d '{
    "worker_name": "Ahmed",
    "earnings_history": [
      {"platform": "Careem", "date": "2025-01-01", "hours_worked": 8, "gross_earned": 2500, "platform_deductions": 500, "net_received": 2000},
      {"platform": "Careem", "date": "2025-01-02", "hours_worked": 7, "gross_earned": 2200, "platform_deductions": 440, "net_received": 1760},
      {"platform": "Careem", "date": "2025-01-03", "hours_worked": 8, "gross_earned": 2400, "platform_deductions": 480, "net_received": 1920},
      {"platform": "Careem", "date": "2025-01-04", "hours_worked": 9, "gross_earned": 2800, "platform_deductions": 1200, "net_received": 1600},
      {"platform": "Careem", "date": "2025-01-05", "hours_worked": 8, "gross_earned": 2500, "platform_deductions": 500, "net_received": 2000}
    ]
  }'
```

## Judges Note
This endpoint is **publicly accessible** (no auth required). You can call it directly with any crafted JSON payload following the schema above. Minimum 3 records for basic analysis; 5+ for trend detection.
