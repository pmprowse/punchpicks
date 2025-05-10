from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import models
from database import get_db

router = APIRouter(
    prefix="/results",
    tags=["results"],
    responses={404: {"description": "Not found"}}
)

class ResultCreate(BaseModel):
    fight_id: int
    winner_id: int
    method: str  # "KO", "SUB", "PTS", "DQ", "NC"
    round: Optional[int] = None
    time: Optional[str] = None

class Result(BaseModel):
    id: int
    fight_id: int
    winner_id: int
    method: str
    round: Optional[int] = None
    time: Optional[str] = None
    
    class Config:
        orm_mode = True

# Submit a fight result
@router.post("/", response_model=Result)
def submit_result(result: ResultCreate, db: Session = Depends(get_db)):
    # Check if fight exists
    fight = db.query(models.Fight).filter(models.Fight.id == result.fight_id).first()
    if not fight:
        raise HTTPException(status_code=404, detail="Fight not found")
    
    # Check if result already exists
    existing_result = db.query(models.Result).filter(models.Result.fight_id == result.fight_id).first()
    if existing_result:
        raise HTTPException(status_code=400, detail="Result already exists for this fight")
    
    # Check if winner is in the fight
    if result.winner_id not in [fight.fighter1_id, fight.fighter2_id]:
        raise HTTPException(status_code=400, detail="Winner must be one of the fighters in the fight")
    
    # Create result
    db_result = models.Result(**result.dict())
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result

# Get result for a fight
@router.get("/fight/{fight_id}", response_model=Result)
def get_fight_result(fight_id: int, db: Session = Depends(get_db)):
    result = db.query(models.Result).filter(models.Result.fight_id == fight_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="No result found for this fight")
    return result

# Add to results.py
@router.get("/accuracy/{user_id}/{event_id}")
def calculate_accuracy(user_id: int, event_id: int, db: Session = Depends(get_db)):
    # Get user's picks for the event
    user_picks = db.query(models.UserEventPicks).filter(
        models.UserEventPicks.user_id == user_id,
        models.UserEventPicks.event_id == event_id
    ).first()
    
    if not user_picks:
        raise HTTPException(status_code=404, detail="No picks found")
    
    # Get all results for this event
    fights = db.query(models.Fight).filter(models.Fight.event_id == event_id).all()
    
    total_picks = 0
    correct_picks = 0
    
    for fight in fights:
        # Check if user made a pick for this fight
        user_pick = next((p for p in user_picks.picks if p["fight_id"] == fight.fight_id), None)
        if not user_pick:
            continue
            
        total_picks += 1
        
        # Get fight result
        result = db.query(models.Result).filter(models.Result.fight_id == fight.id).first()
        if not result:
            continue
            
        # Check if pick is correct
        if user_pick["fighter_id"] == result.winner.fighter_id:
            correct_picks += 1
            
        # Bonus points for correct method prediction
        if user_pick["method"] == result.method:
            correct_picks += 0.5
    
    accuracy = (correct_picks / total_picks * 100) if total_picks > 0 else 0
    
    return {
        "user_id": user_id,
        "event_id": event_id,
        "total_picks": total_picks,
        "correct_picks": correct_picks,
        "accuracy_percentage": accuracy
    }


@router.get("/leaderboard/{event_id}")
def get_event_leaderboard(event_id: int, db: Session = Depends(get_db)):
    """Get leaderboard for a specific event with user accuracy"""
    
    # Get all users who submitted picks for this event
    user_picks = db.query(models.UserEventPicks).filter(
        models.UserEventPicks.event_id == event_id
    ).all()
    
    if not user_picks:
        raise HTTPException(status_code=404, detail="No picks found for this event")
    
    leaderboard = []
    
    for pick in user_picks:
        # Calculate accuracy for each user
        accuracy_result = calculate_user_accuracy(pick.user_id, event_id, db)
        
        # Get user info
        user = db.query(models.User).filter(models.User.id == pick.user_id).first()
        
        leaderboard.append({
            "rank": 0,  # Will be set after sorting
            "user_id": pick.user_id,
            "username": user.username,
            "total_picks": accuracy_result["total_picks"],
            "correct_picks": accuracy_result["correct_picks"],
            "accuracy_percentage": accuracy_result["accuracy_percentage"]
        })
    
    # Sort by accuracy (highest first)
    leaderboard.sort(key=lambda x: x["accuracy_percentage"], reverse=True)
    
    # Assign ranks
    for i, entry in enumerate(leaderboard):
        entry["rank"] = i + 1
    
    return {
        "event_id": event_id,
        "leaderboard": leaderboard
    }

# Helper function to calculate accuracy (extracted from your existing endpoint)
def calculate_user_accuracy(user_id: int, event_id: int, db: Session):
    # Get user's picks for the event
    user_picks = db.query(models.UserEventPicks).filter(
        models.UserEventPicks.user_id == user_id,
        models.UserEventPicks.event_id == event_id
    ).first()
    
    if not user_picks:
        return {
            "total_picks": 0,
            "correct_picks": 0,
            "accuracy_percentage": 0
        }
    
    # Get all results for this event
    fights = db.query(models.Fight).filter(models.Fight.event_id == event_id).all()
    
    total_picks = 0
    correct_picks = 0
    
    for fight in fights:
        # Check if user made a pick for this fight
        user_pick = next((p for p in user_picks.picks if p["fight_id"] == fight.fight_id), None)
        if not user_pick:
            continue
            
        total_picks += 1
        
        # Get fight result
        result = db.query(models.Result).filter(models.Result.fight_id == fight.id).first()
        if not result:
            continue
            
        # Check if pick is correct
        if user_pick["fighter_id"] == result.winner.fighter_id:
            correct_picks += 1
            
        # Bonus points for correct method prediction
        if user_pick["method"] == result.method:
            correct_picks += 0.5
    
    accuracy = (correct_picks / total_picks * 100) if total_picks > 0 else 0
    
    return {
        "total_picks": total_picks,
        "correct_picks": correct_picks,
        "accuracy_percentage": accuracy
    }

# Update a fight result
@router.put("/{result_id}", response_model=Result)
def update_result(result_id: int, result: ResultCreate, db: Session = Depends(get_db)):
    db_result = db.query(models.Result).filter(models.Result.id == result_id).first()
    if not db_result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    for key, value in result.dict().items():
        setattr(db_result, key, value)
    
    db.commit()
    db.refresh(db_result)
    return db_result