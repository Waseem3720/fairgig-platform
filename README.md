# FairGig Platform (SOFTEC 2026)

**Gig Worker Income & Rights Platform**

FairGig empowers gig workers to log, verify, and understand their earnings across platforms, while enabling labour advocates to detect systemic unfairness through data-driven insights.

---

## 🚀 System Architecture

This project strictly follows competition constraints and production-grade practices:

* **6 Microservices Architecture**
  * 4 × FastAPI (Auth, Earnings, Anomaly, Analytics)
  * 2 × Node.js (Grievance, Certificate)
* **Modern Frontend:** React (Vite) with clean, responsive UI
* **Independent Databases:** Each service uses its own **PostgreSQL database**
* **Cloud-Ready Design:** Fully deployable on Render (backend) and Vercel (frontend)
* **Secure Authentication:** JWT-based authentication with role-based access control
* **Cloud Media Storage:** Screenshot uploads handled via Cloudinary
* **Seeded Realistic Dataset:** 100+ workers across multiple cities (Lahore, Karachi, Islamabad)

---

## 🔌 Inter-Service Communication

All services communicate strictly via REST APIs:

* **Auth Service:** Issues JWT tokens and manages roles
* **Earnings Service:** Core data provider (used by Analytics & Certificate)
* **Anomaly Service:** Detects statistical irregularities via API
* **Analytics Service:** Aggregates system-wide insights via Earnings API
* **Grievance Service:** Independent complaint management (Node.js)
* **Certificate Service:** Generates printable reports using verified earnings only

---

## 🔐 Authentication & Roles

FairGig uses **JWT-based authentication** with role-based access control:

### Roles:

* **Worker:** Logs earnings, uploads screenshots, views analytics
* **Verifier:** Reviews and validates submitted earnings
* **Advocate:** Monitors trends, complaints, and system-wide fairness

All protected endpoints require a valid JWT token.

---

## 📊 Core Features

### ✔ Earnings Logger
* Log shifts (platform, hours, earnings, deductions, net)
* CSV import supported
* Screenshot upload (Cloudinary)

### ✔ Screenshot Verification
* Verifiers approve / reject / mark unverifiable
* Verification status stored and displayed

### ✔ Worker Analytics Dashboard
* Weekly/monthly trends
* Effective hourly rate
* Commission tracking
* City-wide median comparison (computed from real data)

### ✔ Anomaly Detection (FastAPI)
* Z-score + IQR based detection
* Flags unusual deductions or income drops
* Provides human-readable explanations

### ✔ Grievance Board (Node.js)
* Workers post complaints
* Advocates tag, cluster, and resolve issues

### ✔ Advocate Analytics Panel
* Commission trends
* Income distribution by city
* Complaint clusters
* Workers with >20% income drop (vulnerability flag)

### ✔ Income Certificate Generator
* Printable HTML report
* Uses only **verified earnings**
* Export-ready for landlords or banks

---

## 🏃♂️ How to Run Locally

Each service runs independently. Use separate terminals. Ensure PostgreSQL is running locally and update the respective `.env` files first.

### 0. Environment Setup & Seeding
Copy the `.env.example` to `.env` in each service folder and configure your PostgreSQL connection and Cloudinary keys.
```bash
# Seed the initial databases for Auth & Earnings
cd seed
pip install psycopg2-binary python-dotenv passlib bcrypt
python seed_data.py
```

### 1. Auth Service
```bash
cd services/auth
pip install -r requirements.txt
python main.py
```
(Port 8001)

### 2. Earnings Service
```bash
cd services/earnings
pip install -r requirements.txt
python main.py
```
(Port 8002)

### 3. Anomaly Service
```bash
cd services/anomaly
pip install -r requirements.txt
python main.py
```
(Port 8003)

### 4. Grievance Service
```bash
cd services/grievance
npm install
npm start
```
(Port 8004)

### 5. Analytics Service
```bash
cd services/analytics
pip install -r requirements.txt
python main.py
```
(Port 8005)

### 6. Certificate Service
```bash
cd services/certificate
npm install
npm start
```
(Port 8006)

### 7. Frontend
```bash
cd frontend
npm install
npm run dev
```
http://localhost:5173

---

## 🔐 Demo Credentials

| Role     | Email                                               |
| -------- | --------------------------------------------------- |
| Worker   | ahmed@gmail.com (or worker1@gmail.com)                      |
| Verifier | verifier@fairgig.com |
| Advocate | advocate@fairgig.com |

Password: `password123`

---

## 🌟 Technical Highlights

* **PostgreSQL per service** (true microservices isolation)
* **JWT-secured APIs with RBAC**
* **Cloudinary-based file handling**
* **Real-time API-based aggregation (no hardcoded data)**
* **Statistical anomaly detection (Z-score + IQR)**
* **Print-optimized certificate rendering**
* **Clean modular architecture with REST boundaries**

---

## 🧠 System Philosophy

FairGig is designed as a **transparency layer for gig economies**.

Instead of relying on platform-provided summaries, it:
* Verifies worker-submitted data
* Detects hidden inconsistencies
* Surfaces systemic unfairness at scale

---

## 🚀 Deployment

* **Backend:** Render (multi-service deployment via web services mapping)
* **Frontend:** Vercel

Environment variables are required for:
* `DATABASE_URL`
* `JWT_SECRET_KEY`
* `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
* Service Cross-Domain URLs (`AUTH_SERVICE_URL`, `EARNINGS_SERVICE_URL`, etc).

---

## ⚠️ Notes

* All analytics are computed dynamically from stored data
* No hardcoded metrics are used
* Verification ensures trust in reported earnings
