from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date

import models
from database import get_db

router = APIRouter(
    prefix="/events",
    tags=["events"],
    responses={404: {"description": "Not found"}}
)

# Pydantic models for request/response validation
class EventBase(BaseModel):
    title: str
    date: date
    location: str
    
class EventCreate(EventBase):
    description: Optional[str] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[date] = None
    location: Optional[str] = None
    description: Optional[str] = None

class Event(EventBase):
    id: int
    description: Optional[str] = None

    class Config:
        orm_mode = True

# Create a new event
@router.post("/", response_model=Event)
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    """
    Create a new event with the following information:
    - title: The name of the event
    - date: The date of the event (YYYY-MM-DD)
    - location: Where the event takes place
    - description: Additional details about the event (optional)
    """
    db_event = models.Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

# Get all events
@router.get("/", response_model=List[Event])
def read_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve a list of all events.
    - skip: Number of events to skip (for pagination)
    - limit: Maximum number of events to return
    """
    events = db.query(models.Event).offset(skip).limit(limit).all()
    return events

# Get a specific event by ID
@router.get("/{event_id}", response_model=Event)
def read_event(event_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific event by its ID.
    """
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event

# Update an event
@router.put("/{event_id}", response_model=Event)
def update_event(event_id: int, event: EventUpdate, db: Session = Depends(get_db)):
    """
    Update an event's information by its ID.
    Only the fields provided will be updated.
    """
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Update event attributes
    update_data = event.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event

# Delete an event
@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """
    Delete an event by its ID.
    """
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(db_event)
    db.commit()
    return {"message": f"Event {event_id} deleted successfully"}