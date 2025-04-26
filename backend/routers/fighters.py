from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

import models
from database import get_db

router = APIRouter(
    prefix="/fighters",
    tags=["fighters"],
    responses={404: {"description": "Not found"}}
)

# Pydantic models for request/response validation
class FighterBase(BaseModel):
    name: str
    fighter_id: str
    
class FighterCreate(FighterBase):
    nickname: Optional[str] = None
    weight_class: Optional[str] = None
    record: Optional[str] = None

class FighterUpdate(BaseModel):
    name: Optional[str] = None
    nickname: Optional[str] = None
    weight_class: Optional[str] = None
    record: Optional[str] = None

class Fighter(FighterBase):
    id: int
    nickname: Optional[str] = None
    weight_class: Optional[str] = None
    record: Optional[str] = None

    class Config:
        orm_mode = True

# Create a new fighter
@router.post("/", response_model=Fighter)
def create_fighter(fighter: FighterCreate, db: Session = Depends(get_db)):
    """
    Create a new fighter with the following information:
    - fighter_id: A unique identifier for the fighter
    - name: The fighter's full name
    - nickname: The fighter's nickname (optional)
    - weight_class: The weight class (optional)
    - record: The fighter's record (optional)
    """
    # Check if fighter already exists
    db_fighter = db.query(models.Fighter).filter(models.Fighter.fighter_id == fighter.fighter_id).first()
    if db_fighter:
        raise HTTPException(status_code=400, detail="Fighter with this ID already exists")
    
    # Create new fighter
    db_fighter = models.Fighter(**fighter.dict())
    db.add(db_fighter)
    db.commit()
    db.refresh(db_fighter)
    return db_fighter

# Get all fighters
@router.get("/", response_model=List[Fighter])
def read_fighters(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve a list of all fighters.
    - skip: Number of fighters to skip (for pagination)
    - limit: Maximum number of fighters to return
    """
    fighters = db.query(models.Fighter).offset(skip).limit(limit).all()
    return fighters

# Get a specific fighter by ID
@router.get("/{fighter_id}", response_model=Fighter)
def read_fighter(fighter_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a specific fighter by their fighter_id.
    """
    db_fighter = db.query(models.Fighter).filter(models.Fighter.fighter_id == fighter_id).first()
    if db_fighter is None:
        raise HTTPException(status_code=404, detail="Fighter not found")
    return db_fighter

# Update a fighter
@router.put("/{fighter_id}", response_model=Fighter)
def update_fighter(fighter_id: str, fighter: FighterUpdate, db: Session = Depends(get_db)):
    """
    Update a fighter's information by their fighter_id.
    Only the fields provided will be updated.
    """
    db_fighter = db.query(models.Fighter).filter(models.Fighter.fighter_id == fighter_id).first()
    if db_fighter is None:
        raise HTTPException(status_code=404, detail="Fighter not found")
    
    # Update fighter attributes
    update_data = fighter.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_fighter, key, value)
    
    db.commit()
    db.refresh(db_fighter)
    return db_fighter

# Delete a fighter
@router.delete("/{fighter_id}")
def delete_fighter(fighter_id: str, db: Session = Depends(get_db)):
    """
    Delete a fighter by their fighter_id.
    """
    db_fighter = db.query(models.Fighter).filter(models.Fighter.fighter_id == fighter_id).first()
    if db_fighter is None:
        raise HTTPException(status_code=404, detail="Fighter not found")
    
    db.delete(db_fighter)
    db.commit()
    return {"message": f"Fighter {fighter_id} deleted successfully"}