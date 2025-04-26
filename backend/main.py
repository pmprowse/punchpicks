from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="Punch Picks API")

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

# Test endpoint
@app.get("/")
def read_root():
    return {"Sup": "Hoe"}

# GET endpoint to retrieve all fights
@app.get("/fights/", response_model=List[schemas.Fight])
def read_fights(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    fights = db.query(models.Fight).offset(skip).limit(limit).all()
    return fights

# GET endpoint to retrieve a specific fight by ID
@app.get("/fights/{fight_id}", response_model=schemas.Fight)
def read_fight(fight_id: str, db: Session = Depends(get_db)):
    fight = db.query(models.Fight).filter(models.Fight.fight_id == fight_id).first()
    if fight is None:
        raise HTTPException(status_code=404, detail="Fight not found")
    return fight