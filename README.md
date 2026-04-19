# FairGig Platform (SOFTEC 2026)

**Gig Worker Income Transparency & Rights Platform**

FairGig empowers gig workers to log, verify, and understand their earnings across platforms, while enabling labour advocates to detect systemic unfairness through data-driven insights.

---

## 🚀 System Architecture

* **6 Independent Microservices**
  * 4 × FastAPI Python: `auth`, `earnings`, `anomaly`, `analytics`
  * 2 × Node.js Express: `grievance`, `certificate`
* **Frontend:** React + Vite with Recharts, Framer Motion, Lucide Icons
* **Databases:** Each service owns its own PostgreSQL database (no cross-DB access)
* **Cloud Storage:** Cloudinary for screenshot uploads
* **Auth:** JWT-based with role-based access control (Worker / Verifier / Advocate)
* **Deployment:** Render (backend) + Vercel (frontend) ready

---

## 🔌 Inter-Service Communication

All services communicate strictly via REST APIs over HTTP:

| From | To | Purpose |
|---|---|---|
| Analytics Service | Earnings Service | Fetch shift data for aggregation |
| Certificate Service | Auth + Earnings | Fetch user profile + verified shifts |
| Frontend | All 6 Services | Role-based UI access via JWT |

---

## 🔐 Roles & Access Control

| Role | What They Can Do |
|---|---|
| **Worker** | Log shifts, upload screenshots, view own analytics, run anomaly check, file grievances, download certificate |
| **Verifier** | View pending screenshot submissions, approve / reject / mark unverifiable |
| **Advocate** | View system-wide analytics, commission trends, vulnerability watchlist, grievance board |

---

## 📊 Implemented Features

### ✅ 1. Earnings Logger (Worker Dashboard)
* Log new shift: Platform, Date, Hours Worked, Gross, Deductions, Net Received
* **Screenshot upload** via drag-click uploader — image sent to Cloudinary, URL stored in DB
* Auto-sets shift to `pending` verification status after screenshot upload
* View last 10 shifts in a detailed table
* CSV bulk import supported (`POST /api/earnings/shifts/import-csv`)

### ✅ 2. Screenshot Verification (Verifier Panel)
* Verifier sees all shifts that have a screenshot attached and are `pending`
* Can view linked Cloudinary evidence image
* Three actions per shift: **Approve** (verified), **Reject** (disputed), **Blurry** (unverifiable)
* Queue auto-clears after action

### ✅ 3. Worker Analytics Dashboard
* **4 stat cards:** Total Net Earnings, Avg Hourly Rate, Avg Commission %, Verified Shifts count
* **Bar + Line chart:** Last 14 shifts showing Net Received (bars) + Commission Rate trend (line)
* **City Median comparison:** Your hourly rate vs city-wide anonymous median
* **AI Anomaly Check panel:** One-click statistical anomaly detection on your shift history

### ✅ 4. Anomaly Detection (FastAPI — Anomaly Service)
* Z-score + IQR statistical analysis on earnings history
* Flags: unusual deductions, sudden income drops, abnormal hourly rates
* Returns human-readable English explanation per anomaly
* Severity levels: `low`, `medium`, `high`

### ✅ 5. Grievance Board (Node.js — Grievance Service)
* Workers post public/anonymous complaints
* Categories: Commission Change, Unjust Deactivation, Payment Delay, Rating Manipulation, Other
* Filter complaints by platform (Careem, Foodpanda, Bykea)
* Advocates can tag and update status (open → under_review → escalated → resolved)
* Anonymous mode: worker identity hidden from other workers

### ✅ 6. Advocate Analytics Panel
* **4 KPI cards:** Total Workers, Vulnerability Flags, Avg Platform Commission, Total Shifts
* **Commission Rate Over Time** chart: per-platform line chart (Careem, Foodpanda, Bykea)
* **Vulnerability Watchlist:** Workers with >20% month-over-month income drop, auto-detected
* **Income Distribution table:** Avg vs Median daily income by city and category

### ✅ 7. Income Certificate (Node.js — Certificate Service)
* Fetches only `verified` shifts from Earnings API (never unverified data)
* Aggregates: Total Gross, Total Deductions, Net Income, Shift Count, Total Hours, Avg Hourly Rate
* Renders a fully print-optimized HTML page
* Unique Certificate Reference ID generated per download
* One-click HTML download via frontend

---

## 🏃 How to Run Locally

### Prerequisites
- PostgreSQL running locally
- Node.js 18+, Python 3.10+
- Cloudinary account (free tier works)

### 0. Setup Environment & Seed Data
Copy `.env.example` → `.env` in each service folder and fill in values.

```bash
cd seed
pip install psycopg2-binary python-dotenv passlib bcrypt
python seed_data.py
```
Seeds: 1 Advocate, 1 Verifier, 100 Workers, 2000+ shifts across 3 cities.

### 1. Auth Service (Port 8001)
```bash
cd services/auth
pip install -r requirements.txt
python main.py
```

### 2. Earnings Service (Port 8002)
```bash
cd services/earnings
pip install -r requirements.txt
python main.py
```

### 3. Anomaly Service (Port 8003)
```bash
cd services/anomaly
pip install -r requirements.txt
python main.py
```

### 4. Grievance Service (Port 8004)
```bash
cd services/grievance
npm install
npm start
```

### 5. Analytics Service (Port 8005)
```bash
cd services/analytics
pip install -r requirements.txt
python main.py
```

### 6. Certificate Service (Port 8006)
```bash
cd services/certificate
npm install
npm start
```

### 7. Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Demo Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Worker 1** | Waseem | waseem@gmail.com | password123 |
| **Worker 2** | Wasqas | wasqas@gmail.com | password123 |
| **Verifier** | Mubisher | mubisher@fairgig.com | password123 |
| **Advocate** | Adnan | adnan@fairgig.com | password123 |

---

## 🌍 Environment Variables Per Service

### `services/auth/.env`
```
DATABASE_URL=postgresql://user:pass@localhost:5432/auth_db
JWT_SECRET_KEY=your-secret
```

### `services/earnings/.env`
```
DATABASE_URL=postgresql://user:pass@localhost:5432/earnings_db
JWT_SECRET_KEY=your-secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### `services/anomaly/.env`
```
JWT_SECRET_KEY=your-secret
```

### `services/grievance/.env`
```
DATABASE_URL=postgresql://user:pass@localhost:5432/grievance_db
JWT_SECRET_KEY=your-secret
PORT=8004
```

### `services/analytics/.env`
```
DATABASE_URL=postgresql://user:pass@localhost:5432/analytics_db
JWT_SECRET_KEY=your-secret
EARNINGS_SERVICE_URL=http://localhost:8002
```

### `services/certificate/.env`
```
JWT_SECRET_KEY=your-secret
EARNINGS_SERVICE_URL=http://localhost:8002
AUTH_SERVICE_URL=http://localhost:8001
PORT=8006
```

> ⚠️ `JWT_SECRET_KEY` must be the **exact same string** across all services.

---

## 🌟 Technical Highlights

* PostgreSQL per service (zero cross-database access)
* JWT-secured APIs with strict RBAC
* Cloudinary cloud storage for screenshots
* Real-time API-based data aggregation (no hardcoded data)
* Z-score + IQR statistical anomaly detection
* Print-optimized income certificate (verified data only)
* Clean REST boundaries between all 6 microservices

---

## 🚀 Deployment

* **Backend:** Render (one web service per microservice)
* **Frontend:** Vercel (set VITE_ environment variables in dashboard)

---

## ⚠️ Judge Notes

* All analytics computed dynamically from live database data
* No hardcoded metrics or fake numbers anywhere
* Screenshot evidence linked to verified Cloudinary URLs
* Privacy maintained: anonymous grievances hide worker identity
* Certificate only reflects verifier-approved shifts
