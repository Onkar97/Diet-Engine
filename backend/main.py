from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from schemas import ChatRequest, RecipeResponse
from rag_service import generate_dietary_chat

app = FastAPI(title="Dietary Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/generate-meal/", response_model=RecipeResponse)
async def chat_with_dietitian(request: ChatRequest):
    try:
        # MOCK DATABASE RETRIEVAL: In a full app, you would query Postgres here using request.household_id
        # Example: user = db.query(Household).filter(Household.id == request.household_id).first()
        mock_medical_constraints = "Patient has severe Celiac disease (NO GLUTEN). Patient is allergic to Peanuts. Patient has Type 2 Diabetes (Keep net carbs under 30g per meal)."
        
        # Convert Pydantic models to standard dictionaries for the Groq API
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # Call the AI
        ai_result = await generate_dietary_chat(
            medical_constraints=mock_medical_constraints,
            conversation_history=history_dicts
        )
        
        return RecipeResponse(
            title=ai_result["title"],
            reasoning=ai_result["reasoning"],
            safe_ingredients=ai_result["safe_ingredients"],
            instructions=ai_result["instructions"]
        )

    except Exception as e:
        print(f"Server Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process dietary request.")