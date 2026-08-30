# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Google API Keys (multiple)
    GOOGLE_API_KEYS = os.getenv("GOOGLE_API_KEY", "").split(",")
    GOOGLE_API_KEYS = [k.strip() for k in GOOGLE_API_KEYS if k.strip()]
    
    # Models
    PRIMARY_MODEL = os.getenv("PRIMARY_MODEL", "gemma-4-31b-it")
    FALLBACK_MODEL = os.getenv("FALLBACK_MODEL", "gemma-4-26b-it")
    
    # Speech-to-Speech (API Live)
    SPEECH_MODEL = os.getenv("SPEECH_MODEL", "gemini-3.5-flash-live")
    
    # ASTRA API
    ASTRA_URL = os.getenv("ASTRA_API_URL", "http://localhost:8000")
    
    # Port
    PORT = int(os.getenv("PORT", 8001))

config = Config()

print(f"[Config] {len(config.GOOGLE_API_KEYS)} Google AI Studio keys loaded.")
print(f"[Config] Speech model: {config.SPEECH_MODEL}")