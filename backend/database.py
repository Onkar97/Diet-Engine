import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# Load variables from the .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Create the async database engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Create a session factory for our database connections
SessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

# Dependency to get a database session for our API endpoints
async def get_db():
    async with SessionLocal() as session:
        yield session