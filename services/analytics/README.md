# FairGig — Analytics Service

Aggregate KPIs for the advocate analytics panel.

## Tech Stack
- **Python 3.10+** / **FastAPI** / **SQLite** (reads earnings.db)

## Quick Start

```bash
cd services/analytics
pip install -r requirements.txt
python main.py
```

Service runs at **http://localhost:8005**  
API docs at **http://localhost:8005/docs**

> **Note:** This service reads from `../earnings/earnings.db`. Start the earnings service first to create the database, or run the seed script.

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/analytics/dashboard` | Full advocate dashboard | Advocate/Verifier |
| GET | `/api/analytics/platforms` | Per-platform overview | Advocate/Verifier |
| GET | `/api/analytics/income-trends` | Monthly income trends | Advocate/Verifier |
