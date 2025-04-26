from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

import models
from database import get_db

router = APIRouter(
    prefix="/picks",
    tags=["picks"],
    responses={404: {"description": "Not found"}}
)

# Pydantic models for request/response validation
class FightPick(BaseModel):
    fight_id: str
    fighter_id: str
    method: str  # "KO", "SUB", "PTS"

class EventPicksSubmit(BaseModel):
    event_id: int
    picks: List[FightPick]

class EventPicksResponse(BaseModel):
    event_id: int
    picks: List[FightPick]
    submitted_at: datetime

    class Config:
        orm_mode = True

# Get current user's picks for an event
@router.get("/event/{event_id}", response_model=EventPicksResponse)
def get_user_picks(
    event_id: int, 
    user_id: int = 1,  # Hardcoded user ID for now - replace with authentication
    db: Session = Depends(get_db)
):
    """
    Get a user's picks for a specific event.
    This will return an empty list if no picks have been submitted yet.
    """
    # Check if event exists
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Get user's picks
    user_picks = db.query(models.UserEventPicks).filter(
        models.UserEventPicks.user_id == user_id,
        models.UserEventPicks.event_id == event_id
    ).first()
    
    if not user_picks:
        # Return empty picks if none exist
        return {
            "event_id": event_id,
            "picks": [],
            "submitted_at": datetime.now()
        }
    
    return user_picks

# Submit picks for an event
@router.post("/event/{event_id}", response_model=EventPicksResponse)
def submit_user_picks(
    event_id: int,
    picks_data: List[FightPick],
    user_id: int = 1,  # Hardcoded user ID for now - replace with authentication
    db: Session = Depends(get_db)
):
    """
    Submit or update a user's picks for an event.
    - Each user can only have one set of picks per event
    - Picks cannot be changed after the event start date
    """
    # Check if event exists
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if event is active
    if not event.is_active:
        raise HTTPException(status_code=400, detail="Event is not active")
    
    # Check if event has started
    if event.start_date and event.start_date < datetime.now():
        raise HTTPException(status_code=400, detail="Event has already started - picks are locked")
    
    # Validate that all fight_ids belong to this event
    event_fight_ids = [fight.fight_id for fight in event.fights]
    for pick in picks_data:
        if pick.fight_id not in event_fight_ids:
            raise HTTPException(status_code=400, detail=f"Fight {pick.fight_id} does not belong to this event")
    
    # Validate that all fighter_ids exist
    for pick in picks_data:
        fighter = db.query(models.Fighter).filter(models.Fighter.fighter_id == pick.fighter_id).first()
        if not fighter:
            raise HTTPException(status_code=400, detail=f"Fighter {pick.fighter_id} not found")
    
    # Convert picks to a format suitable for storing in JSONEncodedDict
    picks_list = []
    for pick in picks_data:
        picks_list.append({
            "fight_id": pick.fight_id,
            "fighter_id": pick.fighter_id,
            "method": pick.method
        })
    
    # Check if user already has picks for this event
    existing_picks = db.query(models.UserEventPicks).filter(
        models.UserEventPicks.user_id == user_id,
        models.UserEventPicks.event_id == event_id
    ).first()
    
    if existing_picks:
        # Update existing picks
        existing_picks.picks = picks_list
        existing_picks.submitted_at = datetime.now()
        db.commit()
        db.refresh(existing_picks)
        return existing_picks
    else:
        # Create new picks
        new_picks = models.UserEventPicks(
            user_id=user_id,
            event_id=event_id,
            picks=picks_list
        )
        db.add(new_picks)
        db.commit()
        db.refresh(new_picks)
        return new_picks