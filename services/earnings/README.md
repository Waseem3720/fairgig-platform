# FairGig — Earnings Service

Shift log management, CSV import, screenshot upload, and verification workflow.

## Tech Stack
- **Python 3.10+**
- **FastAPI** with Uvicorn
- **SQLite** (auto-created `earnings.db`)

## Quick Start

```bash
cd services/earnings
pip install -r requirements.txt
python main.py
```

Service runs at **http://localhost:8002**  
API docs at **http://localhost:8002/docs**

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/earnings/shifts` | Create a new shift log | Worker |
| GET | `/api/earnings/shifts` | List shifts (filtered) | All |
| GET | `/api/earnings/shifts/{id}` | Get single shift | All |
| PUT | `/api/earnings/shifts/{id}` | Update shift | Worker (own) |
| DELETE | `/api/earnings/shifts/{id}` | Delete shift | Worker (own) |
| POST | `/api/earnings/shifts/import-csv` | Bulk CSV import | Worker |
| POST | `/api/earnings/shifts/{id}/screenshot` | Upload screenshot | Worker |
| GET | `/api/earnings/verification/pending` | Pending verifications | Verifier/Advocate |
| PUT | `/api/earnings/verification/{id}` | Verify/dispute shift | Verifier/Advocate |
| GET | `/api/earnings/summary` | Earnings summary | All |
| GET | `/api/earnings/city-median` | City-wide median stats | All |
| GET | `/api/earnings/history/{worker_id}` | Worker history | All |

## CSV Import Format

```csv
platform,date,hours_worked,gross_earned,platform_deductions,net_received,city,zone,category
Careem,2025-01-15,8.5,2500,500,2000,Lahore,Gulberg,ride_hailing
Foodpanda,2025-01-15,6.0,1800,360,1440,Lahore,DHA,delivery
```
