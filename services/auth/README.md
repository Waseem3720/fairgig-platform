# FairGig — Auth Service

JWT-based authentication and role management for the FairGig platform.

## Tech Stack
- **Python 3.10+**
- **FastAPI** with Uvicorn
- **SQLite** (auto-created `auth.db`)
- **JWT** (python-jose) + **bcrypt** (passlib)

## Quick Start

```bash
cd services/auth
pip install -r requirements.txt
python main.py
```

Service runs at **http://localhost:8001**  
API docs at **http://localhost:8001/docs**

## Roles
| Role | Description |
|------|-------------|
| `worker` | Gig worker — logs earnings, views analytics |
| `verifier` | Reviews uploaded screenshots, flags anomalies |
| `advocate` | Monitors aggregate trends, manages grievances |

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login, get JWT tokens | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | Revoke refresh token | Yes |
| GET | `/api/auth/me` | Get current user profile | Yes |
| PUT | `/api/auth/me` | Update profile | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |
| GET | `/api/auth/users` | List users (advocate/verifier) | Yes (advocate/verifier) |
| GET | `/api/auth/users/{id}` | Get user by ID | Yes |
