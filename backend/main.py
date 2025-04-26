from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
from database import engine, get_db
from routers import fighters, events, fights, import_data

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="Punch Picks API", description="API for the Punch Picks MMA prediction application")

# Configure CORS
origins = [
    "http://localhost:5173",  # Default Vite port
    "http://localhost:3000"   # Alternative React port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(fighters.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(fights.router, prefix="/api")
app.include_router(import_data.router, prefix="/api")

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Punch Picks API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "endpoints": {
            "fighters": "/api/fighters",
            "events": "/api/events",
            "fights": "/api/fights",
            "import": "/api/import"
        }
    }

# Health check endpoint
@app.get("/health")
def health_check():
    try:
        # Get a database session
        db = next(get_db())
        # Try a simple query
        db.execute("SELECT 1").fetchall()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}