# app/speech_client.py
import google.generativeai as genai
from app.config import config
from agents.prompts import PERSONA_ORB

class SpeechClient:
    """
    Speech-to-Speech client using Gemini 3.5 Flash Live.
    """
    
    def __init__(self):
        self.api_keys = config.GOOGLE_API_KEYS
        self.speech_model = config.SPEECH_MODEL
        
        if not self.api_keys:
            raise ValueError("No Google AI Studio API keys found!")
        
        print(f"[SpeechClient] Initialized with {len(self.api_keys)} accounts.")
        print(f"[SpeechClient] Speech model: {self.speech_model}")
    
    def process_audio(self, audio_data: bytes, context: str = None) -> str:
        """
        Process audio input and return text response.
        
        Args:
            audio_data (bytes): Audio data (WAV, MP3, etc.)
            context (str, optional): User astrological context.
        
        Returns:
            str: Orb response in text.
        """
        for i, api_key in enumerate(self.api_keys):
            try:
                print(f"[SpeechClient] Trying account {i+1}/{len(self.api_keys)}...")
                
                genai.configure(api_key=api_key)
                
                if context:
                    prompt = f"""
User context:
{context}

Respond philosophically and personally based on the context above.
"""
                else:
                    prompt = "Respond as Orb, philosophically and serenely."
                
                model = genai.GenerativeModel(
                    self.speech_model,
                    system_instruction=PERSONA_ORB
                )
                
                response = model.generate_content([
                    prompt,
                    {"mime_type": "audio/wav", "data": audio_data}
                ])
                
                print(f"[SpeechClient] ✅ Account {i+1} succeeded!")
                return response.text
                
            except Exception as e:
                print(f"[SpeechClient] ❌ Account {i+1} failed: {e}")
                continue
        
        print(f"[SpeechClient] ❌ All accounts failed.")
        return "Sorry, I'm having trouble processing your request right now."
    
    def process_text(self, text: str, context: str = None) -> str:
        """
        Process text input (fallback when audio fails).
        """
        for i, api_key in enumerate(self.api_keys):
            try:
                print(f"[SpeechClient] Trying account {i+1} (text mode)...")
                
                genai.configure(api_key=api_key)
                
                if context:
                    prompt = f"""
User context:
{context}

User question:
{text}

Respond philosophically and personally based on the context above.
"""
                else:
                    prompt = text
                
                model = genai.GenerativeModel(
                    self.speech_model,
                    system_instruction=PERSONA_ORB
                )
                
                response = model.generate_content(prompt)
                
                print(f"[SpeechClient] ✅ Account {i+1} (text) succeeded!")
                return response.text
                
            except Exception as e:
                print(f"[SpeechClient] ❌ Account {i+1} (text) failed: {e}")
                continue
        
        return "Sorry, I'm having trouble processing your request right now."