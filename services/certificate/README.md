# FairGig — Certificate Renderer

Generates a print-friendly HTML income certificate for gig workers based on their verified earnings data.

## Tech Stack
- **Node.js** with Express.js
- HTML/CSS inline template for printability

## Quick Start

```bash
cd services/certificate
npm install
npm start
```

Service runs at **http://localhost:8006**

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/certificate/generate` | Returns a printable HTML income report | Worker |

**Query Parameters:**
- `start_date` (YYYY-MM-DD): Filter earnings
- `end_date` (YYYY-MM-DD): Filter earnings
