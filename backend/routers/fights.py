from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

import models
from database import get_db

router = APIRouter(
    prefix="/fights",
    tags=["fights"],
    responses={404: {"description": "Not found"}}
)

# Pydantic models for request/response validation
class FightBase(BaseModel):
    fight_id: str
    weight_class: str
    
class FightCreate(FightBase):
    event_id: int
    fighter1_id: int
    fighter2_id: int
    is_main_event: bool = False
    order: int = 1

class FightUpdate(BaseModel):
    weight_class: Optional[str] = None
    event_id: Optional[int] = None
    fighter1_id: Optional[int] = None
    fighter2_id: Optional[int] = None
    is_main_event: Optional[bool] = None
    order: Optional[int] = None

class FighterBase(BaseModel):
    id: int
    name: str
    fighter_id: str
    nickname: Optional[str] = None

    class Config:
        orm_mode = True

class Fight(FightBase):
    id: int
    event_id: int
    fighter1_id: int
    fighter2_id: int
    is_main_event: bool
    order: int

    class Config:
        orm_mode = True

class FightWithFighters(Fight):
    fighter1: FighterBase
    fighter2: FighterBase

    class Config:
        orm_mode = True

# Create a new fight
@router.post("/", response_model=Fight)
def create_fight(fight: FightCreate, db: Session = Depends(get_db)):
    """
    Create a new fight with the following information:
    - fight_id: A unique identifier for the fight
    - weight_class: The weight class of the fight
    - event_id: The ID of the event this fight belongs to
    - fighter1_id: The ID of the first fighter
    - fighter2_id: The ID of the second fighter
    - is_main_event: Whether this is the main event (default: false)
    - order: The order of the fight on the card (default: 1)
    """
    # Check if event exists
    event = db.query(models.Event).filter(models.Event.id == fight.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if fighters exist
    fighter1 = db.query(models.Fighter).filter(models.Fighter.id == fight.fighter1_id).first()
    if not fighter1:
        raise HTTPException(status_code=404, detail="Fighter 1 not found")
    
    fighter2 = db.query(models.Fighter).filter(models.Fighter.id == fight.fighter2_id).first()
    if not fighter2:
        raise HTTPException(status_code=404, detail="Fighter 2 not found")
    
    # Check if fight_id already exists
    existing_fight = db.query(models.Fight).filter(models.Fight.fight_id == fight.fight_id).first()
    if existing_fight:
        raise HTTPException(status_code=400, detail="Fight with this ID already exists")
    
    # Create new fight
    db_fight = models.Fight(**fight.dict())
    db.add(db_fight)
    db.commit()
    db.refresh(db_fight)
    return db_fight

# Get all fights
@router.get("/", response_model=List[Fight])
def read_fights(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve a list of all fights.
    - skip: Number of fights to skip (for pagination)
    - limit: Maximum number of fights to return
    """
    fights = db.query(models.Fight).offset(skip).limit(limit).all()
    return fights

# Get all fights with fighter details
@router.get("/with-fighters", response_model=List[FightWithFighters])
def read_fights_with_fighters(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve a list of all fights with fighter details included.
    - skip: Number of fights to skip (for pagination)
    - limit: Maximum number of fights to return
    """
    fights = db.query(models.Fight).offset(skip).limit(limit).all()
    return fights

# Get all fights for a specific event
@router.get("/event/{event_id}", response_model=List[FightWithFighters])
def read_event_fights(event_id: int, db: Session = Depends(get_db)):
    """
    Retrieve all fights for a specific event, with fighter details included.
    """
    # Check if event exists
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    fights = db.query(models.Fight).filter(models.Fight.event_id == event_id).order_by(models.Fight.order).all()
    return fights

# Get a specific fight by ID
@router.get("/{fight_id}", response_model=FightWithFighters)
def read_fight(fight_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a specific fight by its fight_id, with fighter details included.
    """
    db_fight = db.query(models.Fight).filter(models.Fight.fight_id == fight_id).first()
    if db_fight is None:
        raise HTTPException(status_code=404, detail="Fight not found")
    return db_fight

# Update a fight
@router.put("/{fight_id}", response_model=Fight)
def update_fight(fight_id: str, fight: FightUpdate, db: Session = Depends(get_db)):
    """
    Update a fight's information by its fight_id.
    Only the fields provided will be updated.
    """
    db_fight = db.query(models.Fight).filter(models.Fight.fight_id == fight_id).first()
    if db_fight is None:
        raise HTTPException(status_code=404, detail="Fight not found")
    
    # Validate references if they're being updated
    update_data = fight.dict(exclude_unset=True)
    
    if "event_id" in update_data:
        event = db.query(models.Event).filter(models.Event.id == update_data["event_id"]).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
    
    if "fighter1_id" in update_data:
        fighter1 = db.query(models.Fighter).filter(models.Fighter.id == update_data["fighter1_id"]).first()
        if not fighter1:
            raise HTTPException(status_code=404, detail="Fighter 1 not found")
    
    if "fighter2_id" in update_data:
        fighter2 = db.query(models.Fighter).filter(models.Fighter.id == update_data["fighter2_id"]).first()
        if not fighter2:
            raise HTTPException(status_code=404, detail="Fighter 2 not found")
    
    # Update fight attributes
    for key, value in update_data.items():
        setattr(db_fight, key, value)
    
    db.commit()
    db.refresh(db_fight)
    return db_fight

# Delete a fight
@router.delete("/{fight_id}")
def delete_fight(fight_id: str, db: Session = Depends(get_db)):
    """
    Delete a fight by its fight_id.
    """
    db_fight = db.query(models.Fight).filter(models.Fight.fight_id == fight_id).first()
    if db_fight is None:
        raise HTTPException(status_code=404, detail="Fight not found")
    
    db.delete(db_fight)
    db.commit()
    return {"message": f"Fight {fight_id} deleted successfully"}