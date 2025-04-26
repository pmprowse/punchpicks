from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base

class Fight(Base):
    __tablename__ = "fights"

    id = Column(Integer, primary_key=True, index=True)
    fight_id = Column(String, unique=True, index=True)
    weight_class = Column(String, index=True)
    fighter1_name = Column(String)
    fighter1_id = Column(String)
    fighter2_name = Column(String)
    fighter2_id = Column(String)