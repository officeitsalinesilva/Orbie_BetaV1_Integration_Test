from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import Response
from app.models import ToneRequest, BinauralRequest, NoiseRequest, PresetRequest
from app.generator import NeuroacousticGenerator
from app.catalog import PresetCatalog

app = FastAPI(title="Neuroacoustic API", version="0.1.0")
generator = NeuroacousticGenerator()
catalog = PresetCatalog()

@app.get("/catalog")
async def list_presets():
    """Lista todos os presets disponíveis."""
    return {"presets": catalog.list_presets()}

@app.get("/catalog/{preset_id}")
async def get_preset(preset_id: str):
    """Retorna os detalhes de um preset específico."""
    preset = catalog.get_preset(preset_id)
    if not preset:
        raise HTTPException(status_code=404, detail="Preset não encontrado")
    return preset

@app.post("/generate/tone")
async def generate_tone(request: ToneRequest):
    """Gera um tom puro (Sine, Square, Sawtooth, Triangle)."""
    try:
        audio_bytes = generator.generate_tone(
            frequency=request.frequency,
            duration=request.duration,
            volume=request.volume,
            waveform=request.waveform,
            format=request.format
        )
        return Response(content=audio_bytes, media_type=f"audio/{request.format}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/binaural")
async def generate_binaural(request: BinauralRequest):
    """Gera uma batida binaural com Left/Right Frequency."""
    try:
        audio_bytes = generator.generate_binaural(
            left_freq=request.left_frequency,
            right_freq=request.right_frequency,
            duration=request.duration,
            volume=request.volume,
            waveform=request.waveform,
            format=request.format
        )
        return Response(content=audio_bytes, media_type=f"audio/{request.format}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/noise")
async def generate_noise(request: NoiseRequest):
    """Gera ruído (White, Pink, Brown, Blue, Violet, Grey, Rain, Ocean)."""
    try:
        audio_bytes = generator.generate_noise(
            noise_type=request.noise_type,
            duration=request.duration,
            volume=request.volume,
            format=request.format
        )
        return Response(content=audio_bytes, media_type=f"audio/{request.format}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/preset/{preset_id}")
async def generate_preset(preset_id: str, format: str = Query("wav", enum=["wav", "mp3"])):
    """Gera áudio a partir de um preset do catálogo."""
    try:
        audio_bytes = generator.generate_preset(preset_id, format=format)
        return Response(content=audio_bytes, media_type=f"audio/{format}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "OK", "service": "neuroacoustic-api"}

@app.get("/")
async def root():
    return {
        "service": "Neuroacoustic API",
        "version": "0.1.0",
        "endpoints": {
            "catalog": "/catalog",
            "preset_details": "/catalog/{preset_id}",
            "generate_tone": "/generate/tone",
            "generate_binaural": "/generate/binaural",
            "generate_noise": "/generate/noise",
            "generate_preset": "/generate/preset/{preset_id}",
        }
    }