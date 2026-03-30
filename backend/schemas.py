from pydantic import BaseModel, Field
from typing import List

# Represents a single message in the chat history
class ChatMessage(BaseModel):
    role: str = Field(..., description="Must be 'user' or 'ai'")
    content: str

# What React sends to FastAPI
class ChatRequest(BaseModel):
    household_id: int
    messages: List[ChatMessage] = Field(..., description="The full conversation history")

# What FastAPI sends back to React (Structured for safety)
class RecipeResponse(BaseModel):
    title: str
    reasoning: str
    safe_ingredients: List[str]
    instructions: List[str]