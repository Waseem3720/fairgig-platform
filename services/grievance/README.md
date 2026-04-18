# FairGig — Grievance Service

Complaint management, tagging, clustering, and escalation workflow for gig workers.

## Tech Stack
- **Node.js** with Express.js
- **SQLite** via better-sqlite3
- **JWT** authentication (shared secret with auth service)

## Quick Start

```bash
cd services/grievance
npm install
npm start
```

Service runs at **http://localhost:8004**

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/grievances/` | Create complaint | Worker |
| GET | `/api/grievances/` | List complaints | All (workers see own) |
| GET | `/api/grievances/:id` | Get complaint + responses | All |
| PUT | `/api/grievances/:id/status` | Update status/priority | Advocate/Verifier |
| POST | `/api/grievances/:id/tags` | Add tags | Advocate/Verifier |
| POST | `/api/grievances/:id/respond` | Add response | All |
| GET | `/api/grievances/clusters/by-category` | Cluster by category+platform | Advocate/Verifier |
| GET | `/api/grievances/stats/summary` | Complaint statistics | Advocate/Verifier |

## Complaint Categories
- `commission_change` — Unexpected commission rate changes
- `account_deactivation` — Account suspended/deactivated without explanation
- `payment_delay` — Late or missing payments
- `rating_manipulation` — Unfair rating/review practices
- `zone_restriction` — Arbitrary zone or area restrictions
- `support_issue` — Poor platform support response
- `other` — Other issues
