# FairGig Microservices API Documentation

This document outlines the core endpoints for the 6 independent microservices that power the FairGig platform. 
Each service uses standard JWT Bearer authentication where applicable.

---

## 1. Auth Service
**Base URL:** `http://localhost:8001/api/auth`

### `POST /register`
Creates a new user account (worker, advocate, or verifier).
**Request Example:**
```json
{
  "full_name": "Ali Khan",
  "email": "ali@example.com",
  "password": "password123",
  "role": "worker"
}
```
**Response Example:**
```json
{
  "access_token": "eyJhbG...",
  "refresh_token": "eyJhbG...",
  "user": {
    "id": 1,
    "full_name": "Ali Khan",
    "email": "ali@example.com",
    "role": "worker",
    "is_active": true
  }
}
```

### `POST /login`
Authenticates a user and returns JWT tokens.
**Request Example:**
```json
{
  "email": "ali@example.com",
  "password": "password123"
}
```

### `GET /me`
Retrieves the logged-in user's profile.
**Headers:** `Authorization: Bearer <TOKEN>`
**Response:** Same as `user` object above.

---

## 2. Earnings Service
**Base URL:** `http://localhost:8002/api/earnings`

### `POST /shifts`
Logs a new gig shift.
**Headers:** `Authorization: Bearer <TOKEN>`
**Request Example:**
```json
{
  "platform": "Careem",
  "date": "2026-05-01",
  "hours_worked": 8.5,
  "gross_earned": 3000.0,
  "platform_deductions": 600.0,
  "net_received": 2400.0,
  "city": "Lahore"
}
```

### `POST /shifts/{shift_id}/screenshot`
Uploads a screenshot via Cloudinary for income verification.
**Content-Type:** `multipart/form-data`
**Param:** `file` (Image)

### `GET /shifts`
Lists shift logs (worker sees own; advocate/verifier sees all).

### `GET /summary`
Returns an aggregation of shift earnings, hours, and commission rates.

---

## 3. Anomaly Service
**Base URL:** `http://localhost:8003/api/anomaly`

### `POST /detect`
Detects irregularities in earnings mathematically.
**Headers:** `Authorization: Bearer <TOKEN>`
**Request Example:**
```json
{
  "worker_name": "Ahmed",
  "earnings_history": [
    {
      "platform": "Careem",
      "date": "2026-05-01",
      "hours_worked": 8,
      "gross_earned": 2500,
      "platform_deductions": 500,
      "net_received": 2000
    }
  ]
}
```
**Response Example:**
```json
{
  "worker_name": "Ahmed",
  "records_analyzed": 1,
  "anomalies_found": 1,
  "anomalies": [
    {
      "type": "high_deduction",
      "severity": "medium",
      "date": "2026-05-01",
      "metric": "Commission Rate",
      "expected_range": "20%",
      "actual_value": "25%",
      "explanation": "Platform deducted 25% of your gross earnings... This is unusually high."
    }
  ]
}
```

---

## 4. Grievance Service (Node.js)
**Base URL:** `http://localhost:8004/api/grievances`

### `POST /`
Creates a labor complaint.
**Request Example:**
```json
{
  "platform": "Foodpanda",
  "category": "Unjust Deactivation",
  "title": "Account blocked randomly",
  "description": "My account was blocked with zero explanation.",
  "is_anonymous": false
}
```

### `GET /`
Lists complaints.

### `PUT /:id/status`
Updates complaint status (open, resolved, etc.) 
*Restricted to Advocates/Verifiers.*

---

## 5. Analytics Service
**Base URL:** `http://localhost:8005/api/analytics`

### `GET /dashboard`
Provides an advocate with top-level stats across the ecosystem (commission trends, income drops).
**Headers:** `Authorization: Bearer <TOKEN>`

---

## 6. Certificate Service
**Base URL:** `http://localhost:8006/api/certificate`

### `GET /generate`
Generates a printable HTML, mathematically verified working certificate.
**Query Params:** `start_date`, `end_date` (optional)
**Headers:** `Authorization: Bearer <TOKEN>`
