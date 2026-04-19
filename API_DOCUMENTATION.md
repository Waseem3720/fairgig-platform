# FairGig API Documentation

All services use `Authorization: Bearer <JWT_TOKEN>` in headers for protected endpoints.
JWT tokens are issued by the Auth Service on login or registration.

---

## 1. Auth Service — Port 8001
**Base URL:** `http://localhost:8001/api/auth`

### `POST /register`
Register a new user.
**Body:**
```json
{
  "full_name": "Ali Khan",
  "email": "ali@example.com",
  "password": "password123",
  "role": "worker",
  "city": "Lahore",
  "platform": "Careem"
}
```
**Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": { "id": 1, "full_name": "Ali Khan", "email": "ali@example.com", "role": "worker" }
}
```

### `POST /login`
Authenticate and receive JWT tokens.
**Body:**
```json
{ "email": "ali@example.com", "password": "password123" }
```
**Response:** Same shape as `/register`

### `GET /me`
Get logged-in user's profile.
**Auth:** Required
**Response:** User object with id, full_name, email, role, city, platform, is_active

---

## 2. Earnings Service — Port 8002
**Base URL:** `http://localhost:8002/api/earnings`

### `POST /shifts`
Log a new gig shift.
**Auth:** Required (Worker)
**Body:**
```json
{
  "platform": "Careem",
  "date": "2026-04-19",
  "hours_worked": 8.5,
  "gross_earned": 3000.0,
  "platform_deductions": 750.0,
  "net_received": 2250.0,
  "city": "Lahore",
  "zone": "Gulberg",
  "category": "ride_hailing"
}
```
**Response:** Full ShiftLog object with `id`, `verification_status: "pending"`

### `POST /shifts/{shift_id}/screenshot`
Upload screenshot proof to Cloudinary.
**Auth:** Required (Worker — must own the shift)
**Content-Type:** `multipart/form-data`
**Field:** `file` (PNG/JPG image)
**Response:** Updated ShiftLog with `screenshot_url` pointing to Cloudinary CDN link
**Notes:** Automatically sets `verification_status` to `pending`

### `GET /shifts`
List shift logs.
**Auth:** Required
- Workers see only their own shifts
- Verifiers/Advocates see all (filterable by `worker_id`)

**Query Params:** `platform`, `start_date`, `end_date`, `verification_status`, `limit`, `offset`

### `GET /shifts/{shift_id}`
Get a single shift by ID.
**Auth:** Required

### `PUT /shifts/{shift_id}`
Update a shift (Workers only, unverified shifts only).
**Auth:** Required (Worker)

### `DELETE /shifts/{shift_id}`
Delete a shift.
**Auth:** Required (Worker — own shifts only)

### `POST /shifts/import-csv`
Bulk import shifts from CSV file.
**Auth:** Required (Worker)
**Content-Type:** `multipart/form-data`
**Field:** `file` (.csv)
**Expected CSV columns:** `platform, date, hours_worked, gross_earned, platform_deductions, net_received, city, zone, category`

### `GET /summary`
Get earnings summary (totals, averages, commission rate).
**Auth:** Required
**Query Params:** `start_date`, `end_date`, `platform`
**Response:**
```json
{
  "total_gross": 45000.0,
  "total_deductions": 9000.0,
  "total_net": 36000.0,
  "total_hours": 120.0,
  "shift_count": 15,
  "avg_hourly_rate": 300.0,
  "avg_commission_rate": 20.0,
  "verified_count": 10,
  "pending_count": 5
}
```

### `GET /city-median`
Get anonymized city-wide median earnings for comparison.
**Auth:** Required
**Query Params:** `city`, `category`
**Response:**
```json
[{ "city": "Lahore", "category": "ride_hailing", "median_hourly_rate": 285.0, "median_net_daily": 2100.0, "worker_count": 42 }]
```

### `GET /verification/pending`
Get all shifts pending screenshot review.
**Auth:** Required (Verifier or Advocate only)
**Response:** List of ShiftLog objects with `screenshot_url` present

### `PUT /verification/{shift_id}`
Update the verification status of a shift.
**Auth:** Required (Verifier or Advocate only)
**Body:**
```json
{ "verification_status": "verified", "verification_notes": "Screenshot matches reported data." }
```
**Accepted statuses:** `verified`, `disputed`, `unverifiable`

### `GET /history/{worker_id}`
Get earnings history for a worker (used by anomaly service).
**Auth:** Required

---

## 3. Anomaly Service — Port 8003
**Base URL:** `http://localhost:8003/api/anomaly`

### `POST /detect`
Run Z-score + IQR statistical anomaly detection on a worker's earnings history.
**Auth:** Required (JWT)
**Body:**
```json
{
  "worker_name": "Ahmed",
  "earnings_history": [
    {
      "platform": "Careem",
      "date": "2026-04-01",
      "hours_worked": 8,
      "gross_earned": 3000,
      "platform_deductions": 1500,
      "net_received": 1500
    }
  ]
}
```
**Response:**
```json
{
  "worker_name": "Ahmed",
  "records_analyzed": 1,
  "anomalies_found": 1,
  "summary": "⚠️ 1 anomaly detected in your earnings history.",
  "anomalies": [
    {
      "type": "high_deduction_rate",
      "severity": "high",
      "date": "2026-04-01",
      "metric": "Commission Rate",
      "expected_range": "~20%",
      "actual_value": "50%",
      "explanation": "Platform deducted 50% of your gross earnings on this shift. This is unusually high compared to your historical average."
    }
  ]
}
```

---

## 4. Grievance Service — Port 8004
**Base URL:** `http://localhost:8004/api/grievances`

### `POST /`
File a new labor complaint.
**Auth:** Required (Worker)
**Body:**
```json
{
  "platform": "Careem",
  "category": "account_deactivation",
  "title": "Account blocked without explanation",
  "description": "My driver account was blocked with zero reason given.",
  "is_anonymous": false,
  "city": "Lahore",
  "zone": "Gulberg"
}
```
**Categories:** `commission_change`, `account_deactivation`, `payment_delay`, `rating_manipulation`, `other`

### `GET /`
List complaints. Workers see own; Advocates see all.
**Auth:** Required
**Query Params:** `platform`, `category`, `status`, `city`, `limit`, `offset`

### `GET /:id`
Get a single complaint with tags and responses.
**Auth:** Required

### `PUT /:id/status`
Update complaint status or priority.
**Auth:** Required (Advocate or Verifier only)
**Body:** `{ "status": "escalated", "priority": "high" }`
**Statuses:** `open`, `under_review`, `escalated`, `resolved`, `dismissed`

### `POST /:id/tags`
Add tags to a complaint.
**Auth:** Required (Advocate or Verifier only)
**Body:** `{ "tags": ["unfair_deactivation", "no_notice"] }`

### `POST /:id/respond`
Add a response to a complaint.
**Auth:** Required
**Body:** `{ "message": "We are investigating this issue." }`

### `GET /clusters/by-category`
Get complaint counts grouped by category and platform.
**Auth:** Required (Advocate or Verifier only)

### `GET /stats/summary`
Get platform-wide complaint statistics.
**Auth:** Required (Advocate or Verifier only)
**Response:**
```json
{
  "total": 150,
  "by_category": [{ "category": "account_deactivation", "count": 45 }],
  "by_status": [{ "status": "open", "count": 90 }],
  "by_platform": [{ "platform": "Careem", "count": 70 }],
  "this_week": [{ "category": "commission_change", "count": 12 }]
}
```

---

## 5. Analytics Service — Port 8005
**Base URL:** `http://localhost:8005/api/analytics`

### `GET /dashboard`
Get comprehensive system-wide analytics for advocates.
**Auth:** Required (Advocate or Verifier only)
**Note:** Fetches live shift data from the Earnings Service via internal HTTP call.
**Response:**
```json
{
  "total_workers": 102,
  "total_shifts": 2847,
  "total_platforms": 8,
  "avg_commission_rate": 19.5,
  "commission_trends": [
    { "month": "2026-03", "platform": "Careem", "avg_commission_rate": 24.8 }
  ],
  "income_distributions": [
    { "city": "Lahore", "category": "ride_hailing", "worker_count": 42, "avg_net_daily": 2150.0, "median_net_daily": 1980.0 }
  ],
  "vulnerable_workers": [
    { "worker_id": 7, "platform": "Careem", "city": "Lahore", "drop_percentage": 32.5, "prev_month": "2026-02", "curr_month": "2026-03" }
  ]
}
```

---

## 6. Certificate Service — Port 8006
**Base URL:** `http://localhost:8006/api/certificate`

### `GET /generate`
Generate a printable HTML income certificate.
**Auth:** Required (JWT in Authorization header)
**Query Params:** `start_date` (optional), `end_date` (optional)
**Notes:**
- Fetches user profile from Auth Service using the same JWT
- Fetches only `verification_status=verified` shifts from Earnings Service
- Aggregates totals in-memory: Gross, Deductions, Net, Hours, Avg Hourly Rate
- Returns full HTML page with print CSS — download triggers in browser

**Response:** `Content-Type: text/html` — printable certificate with:
- Worker name, platform, email, verification badge
- Breakdown table: Gross / Deductions / Net
- Work statistics: Shift count, total hours, avg hourly rate
- Unique certificate reference ID (FG-CERT-XXXXXXXXX)
