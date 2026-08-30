import json

from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from pydantic import BaseModel

from agents.orb_system import OrbSystem

from app.astra_client import (
    # Context endpoints
    fetch_natal_context,
    fetch_transit_context,
    fetch_synastry_context,
    fetch_composite_context,
    fetch_solar_return_context,
    fetch_lunar_return_context,
    fetch_moon_phase_context,
    fetch_now_context,

    # Data endpoints
    fetch_natal_data,
    fetch_transit_data,
    fetch_synastry_data,
    fetch_composite_data,
    fetch_solar_return_data,
    fetch_lunar_return_data,
    fetch_moon_phase_data,
    fetch_now_data,
    fetch_subject_data,
    fetch_compatibility_score,

    # SVG endpoints
    fetch_natal_svg,
    fetch_synastry_svg,
    fetch_transit_svg,
    fetch_solar_return_svg,
    fetch_lunar_return_svg,
    fetch_composite_svg,
    fetch_now_svg
)

from app.speech_client import SpeechClient


app = FastAPI(title="Orb API")

orb_system = OrbSystem()
speech_client = SpeechClient()


# ============================================
# REQUEST MODELS
# ============================================

class ChatRequest(BaseModel):
    message: str
    user_data: dict | None = None
    zodiac_type: str = "Tropical"
    sidereal_mode: str | None = None


class TransitRequest(BaseModel):
    message: str
    user_data: dict
    transit_data: dict | None = None


class SynastryRequest(BaseModel):
    message: str
    user_data_1: dict
    user_data_2: dict


class SolarReturnRequest(BaseModel):
    message: str
    user_data: dict
    year: int
    return_location: dict | None = None


class LunarReturnRequest(BaseModel):
    message: str
    user_data: dict
    year: int | None = None
    return_location: dict | None = None


class MoonPhaseRequest(BaseModel):
    message: str
    data: dict | None = None


class SvgRequest(BaseModel):
    user_data: dict | None = None
    user_data_1: dict | None = None
    user_data_2: dict | None = None
    theme: str = "classic"
    language: str = "PT"
    year: int | None = None


class SpeechTextRequest(BaseModel):
    message: str
    user_data: dict | None = None
    zodiac_type: str = "Tropical"
    sidereal_mode: str | None = None


# ============================================
# CHAT CONTEXT ENDPOINTS
# ============================================

@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat with natal chart (Tropical or Sidereal)."""

    try:
        context = None

        if request.user_data:
            astra_data = await fetch_natal_context(
                request.user_data,
                request.zodiac_type,
                request.sidereal_mode
            )

            context = astra_data.get("context")

        response = orb_system.chat_with_context(
            request.message,
            context
        )

        return {
            "response": response
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/chat/transits")
async def chat_transits(request: TransitRequest):
    """Chat with current transits or specific date."""

    try:
        astra_data = await fetch_transit_context(
            request.user_data,
            request.transit_data
        )

        context = astra_data.get("context")

        response = orb_system.chat_with_context(
            request.message,
            context
        )

        return {
            "response": response
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/chat/synastry")
async def chat_synastry(request: SynastryRequest):
    """Chat with compatibility analysis between two people."""

    try:
        astra_data = await fetch_synastry_context(
            request.user_data_1,
            request.user_data_2
        )

        context = astra_data.get("context")

        response = orb_system.chat_with_context(
            request.message,
            context
        )

        return {
            "response": response
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/chat/composite")
async def chat_composite(request: SynastryRequest):
    """Chat with composite chart."""

    try:
        astra_data = await fetch_composite_context(
            request.user_data_1,
            request.user_data_2
        )

        context = astra_data.get("context")

        response = orb_system.chat_with_context(
            request.message,
            context
        )

        return {
            "response": response
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/chat/solar-return")
async def chat_solar_return(request: SolarReturnRequest):
    """Chat with solar return."""

    try:
        astra_data = await fetch_solar_return_context(
            request.user_data,
            request.year,
            request.return_location
        )

        context = astra_data.get("context")

        response = orb_system.chat_with_context(
            request.message,
            context
        )

        return {
            "response": response
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/chat/lunar-return")
async def chat_lunar_return(request: LunarReturnRequest):
    """Chat with lunar return."""

    try:
        astra_data = await fetch_lunar_return_context(
            request.user_data,
            request.return_location,
            request.year
        )

        context = astra_data.get("context")

        response = orb_system.chat_with_context(
            request.message,
            context
        )

        return {
            "response": response
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/chat/moon-phase")
async def chat_moon_phase(request: MoonPhaseRequest):
    """Chat with moon phase analysis."""

    try:
        astra_data = await fetch_moon_phase_context(
            request.data
        )

        context = astra_data.get("context")

        response = orb_system.chat_with_context(
            request.message,
            context
        )

        return {
            "response": response
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/chat/now")
async def chat_now(request: ChatRequest):
    """Chat with current moment analysis."""

    try:
        astra_data = await fetch_now_context()

        context = astra_data.get("context")

        response = orb_system.chat_with_context(
            request.message,
            context
        )

        return {
            "response": response
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================
# SPEECH-TO-SPEECH
# ============================================

@app.post("/speech")
async def speech_chat(
    file: UploadFile = File(...),
    user_data: str | None = Form(default=None)
):
    """
    Speech-to-Speech with audio input.

    user_data arrives as a multipart/form-data string because the
    test/client sends it through the form field. Decode it explicitly.
    """

    try:
        audio_data = await file.read()

        parsed_user_data = None

        if user_data:
            try:
                parsed_user_data = json.loads(user_data)
            except json.JSONDecodeError as e:
                raise HTTPException(
                    status_code=422,
                    detail=f"Invalid user_data JSON: {str(e)}"
                )

            if not isinstance(parsed_user_data, dict):
                raise HTTPException(
                    status_code=422,
                    detail="user_data must be a JSON object."
                )

        context = None

        if parsed_user_data:
            astra_data = await fetch_natal_context(
                parsed_user_data
            )

            context = astra_data.get("context")

        response = speech_client.process_audio(
            audio_data,
            context
        )

        return {
            "response": response
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/speech/text")
async def speech_text(request: SpeechTextRequest):
    """Fallback for speech-to-speech via text."""

    try:
        context = None

        if request.user_data:
            astra_data = await fetch_natal_context(
                request.user_data,
                request.zodiac_type,
                request.sidereal_mode
            )

            context = astra_data.get("context")

        response = speech_client.process_text(
            request.message,
            context
        )

        return {
            "response": response
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================
# DATA ENDPOINTS
# ============================================

@app.post("/data/natal")
async def data_natal(request: ChatRequest):
    """Raw natal chart data."""

    try:
        data = await fetch_natal_data(
            request.user_data
        )

        return data

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/data/transits")
async def data_transits(request: TransitRequest):
    """Raw transit data."""

    try:
        data = await fetch_transit_data(
            request.user_data,
            request.transit_data
        )

        return data

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/data/synastry")
async def data_synastry(request: SynastryRequest):
    """Raw synastry data."""

    try:
        data = await fetch_synastry_data(
            request.user_data_1,
            request.user_data_2
        )

        return data

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/data/composite")
async def data_composite(request: SynastryRequest):
    """Raw composite chart data."""

    try:
        data = await fetch_composite_data(
            request.user_data_1,
            request.user_data_2
        )

        return data

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/data/solar-return")
async def data_solar_return(request: SolarReturnRequest):
    """Raw solar return data."""

    try:
        data = await fetch_solar_return_data(
            request.user_data,
            request.year,
            request.return_location
        )

        return data

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/data/lunar-return")
async def data_lunar_return(request: LunarReturnRequest):
    """Raw lunar return data."""

    try:
        data = await fetch_lunar_return_data(
            request.user_data,
            request.return_location,
            request.year
        )

        return data

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/data/moon-phase")
async def data_moon_phase(request: MoonPhaseRequest):
    """Raw moon phase data."""

    try:
        data = await fetch_moon_phase_data(
            request.data
        )

        return data

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/data/now")
async def data_now():
    """Raw current moment data."""

    try:
        data = await fetch_now_data()

        return data

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/data/subject")
async def data_subject(request: ChatRequest):
    """Raw subject data."""

    try:
        data = await fetch_subject_data(
            request.user_data
        )

        return data

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/data/compatibility-score")
async def data_compatibility_score(request: SynastryRequest):
    """Numerical compatibility score."""

    try:
        data = await fetch_compatibility_score(
            request.user_data_1,
            request.user_data_2
        )

        return data

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================
# SVG ENDPOINTS
# ============================================

@app.post("/svg/natal")
async def svg_natal(request: SvgRequest):
    """Natal chart with SVG."""

    try:
        data = await fetch_natal_svg(
            request.user_data,
            request.theme,
            request.language
        )

        return {
            "chart": data.get("chart")
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/svg/transits")
async def svg_transits(request: SvgRequest):
    """Transits with SVG."""

    try:
        data = await fetch_transit_svg(
            request.user_data,
            request.theme,
            request.language
        )

        return {
            "chart": data.get("chart")
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/svg/synastry")
async def svg_synastry(request: SvgRequest):
    """Synastry with SVG."""

    try:
        data = await fetch_synastry_svg(
            request.user_data_1,
            request.user_data_2,
            request.theme,
            request.language
        )

        return {
            "chart": data.get("chart")
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/svg/composite")
async def svg_composite(request: SvgRequest):
    """Composite chart with SVG."""

    try:
        data = await fetch_composite_svg(
            request.user_data_1,
            request.user_data_2,
            request.theme,
            request.language
        )

        return {
            "chart": data.get("chart")
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/svg/solar-return")
async def svg_solar_return(request: SvgRequest):
    """Solar return with SVG."""

    try:
        if request.year is None:
            raise HTTPException(
                status_code=422,
                detail="year is required for solar return."
            )

        data = await fetch_solar_return_svg(
            request.user_data,
            request.year,
            request.theme,
            request.language
        )

        return {
            "chart": data.get("chart")
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/svg/lunar-return")
async def svg_lunar_return(request: SvgRequest):
    """Lunar return with SVG."""

    try:
        data = await fetch_lunar_return_svg(
            request.user_data,
            request.theme,
            request.language,
            request.year
        )

        return {
            "chart": data.get("chart")
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/svg/now")
async def svg_now(request: SvgRequest):
    """Current moment with SVG."""

    try:
        data = await fetch_now_svg(
            request.theme,
            request.language
        )

        return {
            "chart": data.get("chart")
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================
# ROOT
# ============================================

@app.get("/")
async def root():
    return {
        "status": "Orb API online",
        "model": "Gemma 4 31B",
        "endpoints": [
            "/chat (Natal)",
            "/chat/transits",
            "/chat/synastry",
            "/chat/composite",
            "/chat/solar-return",
            "/chat/lunar-return",
            "/chat/moon-phase",
            "/chat/now",

            "/speech (Audio)",
            "/speech/text (Fallback)",

            "/data/natal",
            "/data/transits",
            "/data/synastry",
            "/data/composite",
            "/data/solar-return",
            "/data/lunar-return",
            "/data/moon-phase",
            "/data/now",
            "/data/subject",
            "/data/compatibility-score",

            "/svg/natal",
            "/svg/transits",
            "/svg/synastry",
            "/svg/composite",
            "/svg/solar-return",
            "/svg/lunar-return",
            "/svg/now"
        ]
    }