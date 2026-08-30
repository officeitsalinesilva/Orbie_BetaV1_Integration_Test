# agents/router.py
import google.generativeai as genai
from app.config import config
from agents.prompts import PERSONA_ORB

class AIRouter:
    """
    AI Router with automatic fallback between multiple accounts.
    """
    
    def __init__(self):
        self.api_keys = config.GOOGLE_API_KEYS
        
        if not self.api_keys:
            raise ValueError("No Google AI Studio API keys found!")
        
        self.primary_model = config.PRIMARY_MODEL
        self.fallback_model = config.FALLBACK_MODEL
        
        print(f"[AIRouter] Initialized with {len(self.api_keys)} Google AI Studio accounts.")
        print(f"[AIRouter] Primary model: {self.primary_model}")
        print(f"[AIRouter] Fallback model: {self.fallback_model}")
    
    def chat(self, message: str, context: str = None) -> str:
        """Send message with automatic account fallback."""
        
        if context:
            prompt = f"""
User context:
{context}

User question:
{message}

Respond philosophically and personally based on the context above.
"""
        else:
            prompt = message
        
        for i, api_key in enumerate(self.api_keys):
            try:
                print(f"[AIRouter] Trying account {i+1}/{len(self.api_keys)}...")
                
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel(
                    self.primary_model,
                    system_instruction=PERSONA_ORB
                )
                
                response = model.generate_content(prompt)
                
                print(f"[AIRouter] ✅ Account {i+1} succeeded!")
                return response.text
                
            except Exception as e:
                print(f"[AIRouter] ❌ Account {i+1} failed: {e}")
                continue
        
        print(f"[AIRouter] All accounts failed. Trying fallback model...")
        try:
            genai.configure(api_key=self.api_keys[0])
            model = genai.GenerativeModel(
                self.fallback_model,
                system_instruction=PERSONA_ORB
            )
            response = model.generate_content(prompt)
            print(f"[AIRouter] ✅ Fallback model succeeded!")
            return response.text
        except Exception as e:
            print(f"[AIRouter] ❌ Fallback model also failed: {e}")
            return "Sorry, I'm having trouble processing your request right now."
    
    def chat_with_context(self, message: str, context: str) -> str:
        """Send message with explicit context."""
        return self.chat(message, context)