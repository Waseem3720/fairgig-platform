# FairGig Platform (SOFTEC 2026)
**Gig Worker Income & Rights Platform**

FairGig empowers gig workers to log, verify, and understand their earnings across platforms, while giving labour advocates a systemic dashboard to spot unfairness at scale.

## 🚀 System Architecture

This project strictly adheres to the competition constraints:
- **No Docker needed.**
- **6 Microservices** (4 FastAPI + 2 Node.js).
- **Modern React (Vite) frontend with glassmorphism UI**
- **Database Architecture:** Each microservice uses an isolated SQLite database for development simplicity. The architecture is fully database-agnostic and can be migrated to PostgreSQL in production without architectural changes.
- **Fully seeded dataset** simulating 100+ gig workers across Lahore, Karachi, and Islamabad.

## 🔌 Inter-Service Communication
- **Auth Service:** Issues JWT tokens used across all services
- **Earnings Service:** Provides core data to Analytics and Anomaly services
- **Anomaly Service:** Analyzes earnings logs via REST API
- **Grievance Service:** Operates independently (Node.js)
- **Certificate Service:** Consumes verified earnings only

## 🏃‍♂️ How to Run the App Locally

Each service is independently runnable using a single command. Each service is independent and can be scaled or deployed separately. Services can be started in separate terminals or managed individually. *(Make sure you have Node.js 18+ and Python 3.10+ installed).*

### 1. Start the Auth Service (FastAPI)
```bash
cd services/auth
pip install -r requirements.txt
python main.py
```
*(Runs on Port 8001)*

### 2. Start the Earnings Service (FastAPI)
```bash
cd services/earnings
pip install -r requirements.txt
python main.py
```
*(Runs on Port 8002)*

### 3. Start the Anomaly Service (FastAPI - REQUIRED)
```bash
cd services/anomaly
pip install -r requirements.txt
python main.py
```
*(Runs on Port 8003. Exposes a documented REST endpoint for direct judge evaluation: POST /api/anomaly/detect)*

### 4. Start the Grievance Service (Node.js - REQUIRED)
```bash
cd services/grievance
npm install
npm start
```
*(Runs on Port 8004)*

### 5. Start the Analytics Service (FastAPI)
```bash
cd services/analytics
pip install -r requirements.txt
python main.py
```
*(Runs on Port 8005)*

### 6. Start the Certificate Engine (Node.js)
```bash
cd services/certificate
npm install
npm start
```
*(Runs on Port 8006)*

### 7. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

## 🔐 Built-In Demo Login Credentials (All passwords are `password123`)

The database is already **seeded** and populated with over 3,000 shift logs and 100+ simulated users. You can immediately log into the React front-end using any of these roles:

| Role | Email |
|------|-------|
| **Worker** (Ahmed - Careem worker) | `ahmed@gmail.com` |
| **Worker** (Other simulated user) | `worker1@gmail.com` |
| **Advocate Analyst** | `advocate@fairgig.com` |
| **Verifier** | `verifier@fairgig.com` |

## 🌟 Key Technical Highlights
- **Statistical anomaly detection:** Built using robust Z-score and IQR methods
- **Fully modular architecture:** 6 distinct, independent microservices
- **Real seeded dataset:** Simulating 100+ workers and multi-city environments
- **Dynamic city-wide median computation:** Aggregate mathematical calculations, not hardcoded
- **Print-ready income certificate generator:** HTML-based secure PDF-style exporting
- **Role-based access control:** Explicit authorization boundaries for Worker, Verifier, and Advocate

## 🧠 System Philosophy
FairGig is not just a data logging system — it is a transparency layer for gig economies that transforms raw earnings into verified, explainable, and analyzable financial insights to detect systemic unfairness.

The system is designed as a real-world inspired transparency platform for detecting systemic income unfairness in gig economies using modular microservices and statistical analysis.
