from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date

import models
from database import get_db

router = APIRouter(
    prefix="/import",
    tags=["import"],
    responses={500: {"description": "Import error"}}
)

# Pydantic models for bulk import
class FighterImport(BaseModel):
    fighter_id: str
    name: str
    nickname: Optional[str] = None
    weight_class: Optional[str] = None
    record: Optional[str] = None

class FightImport(BaseModel):
    fight_id: str
    weight_class: str
    fighter1: FighterImport
    fighter2: FighterImport
    is_main_event: bool = False
    order: int

class EventImport(BaseModel):
    title: str
    date: date
    location: str
    description: Optional[str] = None
    fights: List[FightImport]

class ImportResponse(BaseModel):
    event_id: int
    message: str
    fighters_created: int
    fights_created: int

# Bulk import endpoint
@router.post("/event", response_model=ImportResponse)
def import_event(event_data: EventImport, db: Session = Depends(get_db)):
    """
    Import a complete event with fighters and fights in a single operation.
    This endpoint will:
    1. Create the event
    2. Create fighters if they don't exist
    3. Create all fights for the event
    """
    try:
        # Create the event
        db_event = models.Event(
            title=event_data.title,
            date=event_data.date,
            location=event_data.location,
            description=event_data.description
        )
        db.add(db_event)
        db.flush()  # Get the event ID while still in transaction
        
        # Dict to track fighters we've created
        fighters_map = {}
        fighters_created = 0
        
        # Create fights and fighters
        for fight_data in event_data.fights:
            # Process fighter 1
            fighter1 = fight_data.fighter1
            fighter1_id = None
            
            if fighter1.fighter_id not in fighters_map:
                # Check if fighter exists
                db_fighter1 = db.query(models.Fighter).filter(
                    models.Fighter.fighter_id == fighter1.fighter_id
                ).first()
                
                if not db_fighter1:
                    # Create new fighter
                    db_fighter1 = models.Fighter(
                        fighter_id=fighter1.fighter_id,
                        name=fighter1.name,
                        nickname=fighter1.nickname,
                        weight_class=fighter1.weight_class,
                        record=fighter1.record
                    )
                    db.add(db_fighter1)
                    db.flush()
                    fighters_created += 1
                
                fighters_map[fighter1.fighter_id] = db_fighter1.id
            
            fighter1_id = fighters_map[fighter1.fighter_id]
            
            # Process fighter 2
            fighter2 = fight_data.fighter2
            fighter2_id = None
            
            if fighter2.fighter_id not in fighters_map:
                # Check if fighter exists
                db_fighter2 = db.query(models.Fighter).filter(
                    models.Fighter.fighter_id == fighter2.fighter_id
                ).first()
                
                if not db_fighter2:
                    # Create new fighter
                    db_fighter2 = models.Fighter(
                        fighter_id=fighter2.fighter_id,
                        name=fighter2.name,
                        nickname=fighter2.nickname,
                        weight_class=fighter2.weight_class,
                        record=fighter2.record
                    )
                    db.add(db_fighter2)
                    db.flush()
                    fighters_created += 1
                
                fighters_map[fighter2.fighter_id] = db_fighter2.id
            
            fighter2_id = fighters_map[fighter2.fighter_id]
            
            # Create the fight
            db_fight = models.Fight(
                fight_id=fight_data.fight_id,
                event_id=db_event.id,
                fighter1_id=fighter1_id,
                fighter2_id=fighter2_id,
                weight_class=fight_data.weight_class,
                is_main_event=fight_data.is_main_event,
                order=fight_data.order
            )
            db.add(db_fight)
        
        # Commit all changes if everything is successful
        db.commit()
        
        return {
            "event_id": db_event.id,
            "message": f"Event '{event_data.title}' imported successfully",
            "fighters_created": fighters_created,
            "fights_created": len(event_data.fights)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")

# Sample data import endpoint (for testing/development)
@router.post("/sample-data", response_model=ImportResponse)
def import_sample_data(db: Session = Depends(get_db)):
    """
    Import a sample UFC event with fighters and fights.
    This is useful for testing/development.
    """
    # Sample event data
    sample_event = EventImport(
        title="UFC 300",
        date=date(2023, 12, 16),
        location="Las Vegas, Nevada",
        description="Historic UFC event featuring championship fights",
        fights=[
            FightImport(
                fight_id="fight1",
                weight_class="Featherweight",
                fighter1=FighterImport(
                    fighter_id="volkanovski",
                    name="Alexander Volkanovski",
                    nickname="The Great",
                    weight_class="Featherweight",
                    record="25-2"
                ),
                fighter2=FighterImport(
                    fighter_id="lopes",
                    name="Diego Lopes",
                    weight_class="Featherweight",
                    record="23-5"
                ),
                is_main_event=True,
                order=1
            ),
            FightImport(
                fight_id="fight2",
                weight_class="Lightweight",
                fighter1=FighterImport(
                    fighter_id="pimblett",
                    name="Paddy Pimblett",
                    nickname="The Baddy",
                    weight_class="Lightweight",
                    record="20-3"
                ),
                fighter2=FighterImport(
                    fighter_id="chandler",
                    name="Michael Chandler",
                    nickname="Iron",
                    weight_class="Lightweight",
                    record="23-8"
                ),
                is_main_event=False,
                order=2
            ),
            FightImport(
                fight_id="fight3",
                weight_class="Featherweight",
                fighter1=FighterImport(
                    fighter_id="rodriguez",
                    name="Yair Rodriguez",
                    nickname="El Pantera",
                    weight_class="Featherweight",
                    record="16-4"
                ),
                fighter2=FighterImport(
                    fighter_id="pitbull",
                    name="Patricio Pitbull",
                    nickname="Pitbull",
                    weight_class="Featherweight",
                    record="35-6"
                ),
                is_main_event=False,
                order=3
            )
        ]
    )
    
    # Use the event import endpoint
    return import_event(sample_event, db)