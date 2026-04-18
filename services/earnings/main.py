from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from database import engine, Base
from routes import router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FairGig Earnings Service",
    description="Shift log CRUD, CSV import, screenshot upload, and verification status tracking.",
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

# Serve uploaded screenshots
upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Mount routes
app.include_router(router, prefix="/api/earnings", tags=["Earnings"])


@app.get("/", tags=["Health"])
def health_check():
    return {"service": "earnings", "status": "running", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
