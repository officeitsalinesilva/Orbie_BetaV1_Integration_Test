import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8002))
    SAMPLE_RATE = int(os.getenv("SAMPLE_RATE", 44100))
    DEFAULT_FORMAT = os.getenv("DEFAULT_FORMAT", "wav")
    DEFAULT_VOLUME = float(os.getenv("DEFAULT_VOLUME", 0.5))
    
    PRESETS_DIR = os.path.join(os.path.dirname(__file__), "..", "presets")

config = Config()
