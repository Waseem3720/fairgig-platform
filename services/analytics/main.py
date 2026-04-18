from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router

app = FastAPI(
    title="FairGig Analytics Service",
    description="Aggregate KPIs for the advocate panel. Commission trends, income distributions, vulnerability flags.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/analytics", tags=["Analytics"])


@app.get("/", tags=["Health"])
def health_check():
    return {"service": "analytics", "status": "running", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8005, reload=True)
