from pydantic import BaseModel
from typing import List, Optional

# Schema for Fight data
class FightBase(BaseModel):
    fight_id: str
    weight_class: str
    fighter1_name: str
    fighter1_id: str
    fighter2_name: str
    fighter2_id: str

class FightCreate(FightBase):
    pass

class Fight(FightBase):
    id: int

    class Config:
        orm_mode = True