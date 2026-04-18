from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FairGig Auth Service",
    description="JWT authentication, role management, and token refresh for the FairGig platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(router, prefix="/api/auth", tags=["Authentication"])


@app.get("/", tags=["Health"])
def health_check():
    return {"service": "auth", "status": "running", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
