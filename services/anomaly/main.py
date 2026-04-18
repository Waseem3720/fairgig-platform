from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import AnomalyRequest, AnomalyResponse
from detector import detect_anomalies, generate_summary, METHODOLOGY

app = FastAPI(
    title="FairGig Anomaly Detection Service",
    description=(
        "Statistical anomaly detection for gig worker earnings. "
        "Accepts a worker's earnings history and returns flagged anomalies "
        "with plain-language explanations. "
        "Judges can call the /api/anomaly/detect endpoint directly with a crafted payload."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def health_check():
    return {"service": "anomaly", "status": "running", "version": "1.0.0"}


@app.post("/api/anomaly/detect", response_model=AnomalyResponse, tags=["Anomaly Detection"])
def detect(request: AnomalyRequest):
    """
    **Anomaly Detection Endpoint**

    Accepts a worker's earnings history and returns statistically flagged anomalies
    with plain-language, human-readable explanations.

    **Detection Methods:**
    - Z-Score analysis for unusual deductions and hours
    - IQR (Interquartile Range) for hourly rate outliers
    - Month-over-month income drop detection (>20% threshold)
    - Platform commission rate trend analysis

    **Example Payload:**
    ```json
    {
        "worker_name": "Ahmed",
        "earnings_history": [
            {
                "platform": "Careem",
                "date": "2025-01-15",
                "hours_worked": 8,
                "gross_earned": 2500,
                "platform_deductions": 500,
                "net_received": 2000
            }
        ]
    }
    ```

    Judges: You can call this endpoint directly with crafted payloads.
    Minimum 3 records needed for basic analysis; 5+ recommended for trend detection.
    """
    anomalies = detect_anomalies(request.earnings_history)
    summary = generate_summary(
        request.worker_name,
        len(request.earnings_history),
        anomalies,
    )

    return AnomalyResponse(
        worker_name=request.worker_name,
        records_analyzed=len(request.earnings_history),
        anomalies_found=len(anomalies),
        anomalies=anomalies,
        summary=summary,
        methodology=METHODOLOGY.strip(),
    )


@app.get("/api/anomaly/methodology", tags=["Anomaly Detection"])
def get_methodology():
    """Returns the documented detection methodology."""
    return {"methodology": METHODOLOGY.strip()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)
