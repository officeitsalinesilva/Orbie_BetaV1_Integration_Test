from pydantic import BaseModel
from typing import Optional, Literal

class ToneRequest(BaseModel):
    frequency: int = 432
    duration: int = 60
    volume: float = 0.5
    waveform: Literal["sine", "square", "sawtooth", "triangle"] = "sine"
    format: Literal["wav", "mp3"] = "wav"

class BinauralRequest(BaseModel):
    left_frequency: int = 200
    right_frequency: int = 208
    duration: int = 60
    volume: float = 0.5
    waveform: Literal["sine", "square", "sawtooth", "triangle"] = "sine"
    format: Literal["wav", "mp3"] = "wav"

class NoiseRequest(BaseModel):
    noise_type: Literal["white", "pink", "brown", "blue", "violet", "grey", "rain", "ocean"] = "white"
    duration: int = 60
    volume: float = 0.3
    format: Literal["wav", "mp3"] = "wav"

class PresetRequest(BaseModel):
    preset_id: str
    duration: Optional[int] = None
    format: Literal["wav", "mp3"] = "wav"
