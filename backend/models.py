from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from database import Base

class Household(Base):
    __tablename__ = 'households'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    
    # Links to the profiles
    members = relationship("DietaryProfile", back_populates="household")

class DietaryProfile(Base):
    __tablename__ = 'dietary_profiles'
    id = Column(Integer, primary_key=True, index=True)
    household_id = Column(Integer, ForeignKey('households.id'))
    allergies = Column(JSON) # e.g., ["peanuts", "shellfish"]
    medical_conditions = Column(JSON) # e.g., ["CKD Stage 2", "Celiac"]
    
    household = relationship("Household", back_populates="members")

class RecipeContext(Base):
    """This table stores medical guidelines and recipes for RAG searches"""
    __tablename__ = 'recipe_context'
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String) 
    embedding = Column(Vector(1536)) # The vector dimension size