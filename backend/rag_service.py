import json
from groq import AsyncGroq
from typing import List, Dict

client = AsyncGroq()

async def generate_dietary_chat(medical_constraints: str, conversation_history: List[Dict]) -> dict:
    # 1. The Immutable System Prompt (Guardrails)
    system_prompt = f"""
    You are an expert Clinical Dietary AI. Your job is to engage in conversation and design meals that STRICTLY adhere to the following medical constraints.
    
    CRITICAL HOUSEHOLD CONSTRAINTS:
    {medical_constraints}
    
    You must remember the conversation history, but NEVER violate the medical constraints, even if the user begs you to.
    
    You must ALWAYS output a valid JSON object with exactly these keys:
    - "title": String (The name of the dish or 'General Advice')
    - "reasoning": String (Explanation of how you accommodated their request AND the medical constraints)
    - "safe_ingredients": Array of strings (List of safe ingredients. Empty array if just chatting.)
    - "instructions": Array of strings (Step-by-step. Empty array if just chatting.)
    """
    
    # 2. Build the Message Array for Groq
    messages = [{"role": "system", "content": system_prompt}]
    
    for msg in conversation_history:
        # Groq expects 'assistant', not 'ai'
        role = "assistant" if msg["role"] == "ai" else msg["role"]
        messages.append({"role": role, "content": msg["content"]})
        
    # 3. Call Llama 3.1
    response = await client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        response_format={"type": "json_object"},
        temperature=0.3 # Low temperature to prevent hallucinating dangerous ingredients
    )
    
    return json.loads(response.choices[0].message.content)