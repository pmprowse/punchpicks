from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base

class Fighter(Base):
    __tablename__ = "fighters"
    
    id = Column(Integer, primary_key=True, index=True)
    fighter_id = Column(String, unique=True, index=True)
    name = Column(String)
    nickname = Column(String, nullable=True)
    record = Column(String, nullable=True)
    weight_class = Column(String, nullable=True)
    
    # Relationships - not required but helpful for queries
    fights_as_fighter1 = relationship("Fight", foreign_keys="Fight.fighter1_id", back_populates="fighter1")
    fights_as_fighter2 = relationship("Fight", foreign_keys="Fight.fighter2_id", back_populates="fighter2")

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    date = Column(Date)
    location = Column(String)
    description = Column(Text, nullable=True)
    
    # Relationships
    fights = relationship("Fight", back_populates="event", cascade="all, delete-orphan")

class Fight(Base):
    __tablename__ = "fights"
    
    id = Column(Integer, primary_key=True, index=True)
    fight_id = Column(String, unique=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    fighter1_id = Column(Integer, ForeignKey("fighters.id"))
    fighter2_id = Column(Integer, ForeignKey("fighters.id"))
    weight_class = Column(String)
    is_main_event = Column(Boolean, default=False)
    order = Column(Integer)
    
    # Relationships
    event = relationship("Event", back_populates="fights")
    fighter1 = relationship("Fighter", foreign_keys=[fighter1_id], back_populates="fights_as_fighter1")
    fighter2 = relationship("Fighter", foreign_keys=[fighter2_id], back_populates="fights_as_fighter2")
    picks = relationship("Pick", back_populates="fight", cascade="all, delete-orphan")
    result = relationship("Result", back_populates="fight", uselist=False, cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    email = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    picks = relationship("Pick", back_populates="user", cascade="all, delete-orphan")

class Pick(Base):
    __tablename__ = "picks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    fight_id = Column(Integer, ForeignKey("fights.id"))
    fighter_id = Column(Integer, ForeignKey("fighters.id"))
    method = Column(String)  # "KO", "SUB", "PTS"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="picks")
    fight = relationship("Fight", back_populates="picks")
    fighter = relationship("Fighter")

class Result(Base):
    __tablename__ = "results"
    
    id = Column(Integer, primary_key=True, index=True)
    fight_id = Column(Integer, ForeignKey("fights.id"), unique=True)
    winner_id = Column(Integer, ForeignKey("fighters.id"))
    method = Column(String)  # "KO", "SUB", "PTS", "DQ", "NC"
    round = Column(Integer, nullable=True)
    time = Column(String, nullable=True)
    
    # Relationships
    fight = relationship("Fight", back_populates="result")
    winner = relationship("Fighter")