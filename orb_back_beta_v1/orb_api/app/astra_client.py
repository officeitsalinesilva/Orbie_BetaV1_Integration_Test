import httpx
from datetime import datetime, timezone

from app.config import config


ASTRA_URL = "http://localhost:8000"


# ============================================
# HELPERS
# ============================================

def _current_year() -> int:
    """Return the current UTC year."""
    return datetime.now(timezone.utc).year


def _normalize_transit_subject(subject: dict) -> dict:
    """
    Normalize a transit subject for Astrologer API v5.

    The /now/subject endpoint returns location fields using:
        lng
        lat
        tz_str

    Transit endpoints expect:
        longitude
        latitude
        timezone

    Transit subjects inherit zodiac/perspective/house configuration
    from the natal subject and therefore should not carry those fields.
    """

    if not subject:
        raise ValueError("Transit subject cannot be empty.")

    normalized = {}

    # --------------------------------------------
    # BASIC SUBJECT FIELDS
    # --------------------------------------------

    allowed_fields = {
        "name",
        "year",
        "month",
        "day",
        "hour",
        "minute",
        "second",
        "city",
        "nation",
        "longitude",
        "latitude",
        "timezone",
        "altitude",
        "geonames_username",
    }

    for key in allowed_fields:
        if key in subject:
            normalized[key] = subject[key]

    # --------------------------------------------
    # LOCATION ALIASES
    # --------------------------------------------
    # /now/subject returns:
    #   lng
    #   lat
    #   tz_str
    #
    # Transit endpoints expect:
    #   longitude
    #   latitude
    #   timezone

    if "longitude" not in normalized and "lng" in subject:
        normalized["longitude"] = subject["lng"]

    if "latitude" not in normalized and "lat" in subject:
        normalized["latitude"] = subject["lat"]

    if "timezone" not in normalized and "tz_str" in subject:
        normalized["timezone"] = subject["tz_str"]

    # --------------------------------------------
    # DEFAULT NAME
    # --------------------------------------------

    if not normalized.get("name"):
        normalized["name"] = "Transit"

    # --------------------------------------------
    # VALIDATION
    # --------------------------------------------

    required_location_fields = {
        "longitude",
        "latitude",
        "timezone",
    }

    missing = [
        field
        for field in required_location_fields
        if normalized.get(field) is None
    ]

    if missing:
        raise ValueError(
            "Transit subject is missing required location fields: "
            + ", ".join(missing)
        )

    return normalized


async def _fetch_current_transit_subject(
    client: httpx.AsyncClient
) -> dict:
    """
    Fetch the current UTC subject and normalize it for transit endpoints.
    """

    response = await client.post(
        f"{ASTRA_URL}/api/v5/now/subject",
        json={}
    )
    response.raise_for_status()

    now_data = response.json()
    subject = now_data.get("subject")

    if not subject:
        raise ValueError(
            "Astrologer API /now/subject did not return a subject."
        )

    return _normalize_transit_subject(subject)


# ============================================
# CONTEXT ENDPOINTS (XML FOR AI)
# ============================================

async def fetch_natal_context(
    user_data: dict,
    zodiac_type: str = "Tropical",
    sidereal_mode: str = None
):
    """Natal chart with XML context."""

    payload = {
        "subject": dict(user_data)
    }

    if zodiac_type == "Sidereal" and sidereal_mode:
        payload["subject"]["zodiac_type"] = "Sidereal"
        payload["subject"]["sidereal_mode"] = sidereal_mode

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/context/birth-chart",
            json=payload
        )
        response.raise_for_status()
        return response.json()


async def fetch_transit_context(
    user_data: dict,
    transit_data: dict = None
):
    """Transits (current or specific date)."""

    async with httpx.AsyncClient() as client:

        if transit_data:
            transit_subject = _normalize_transit_subject(transit_data)
        else:
            transit_subject = await _fetch_current_transit_subject(client)

        response = await client.post(
            f"{ASTRA_URL}/api/v5/context/transit",
            json={
                "first_subject": user_data,
                "transit_subject": transit_subject
            }
        )

        response.raise_for_status()
        return response.json()


async def fetch_synastry_context(
    user_data_1: dict,
    user_data_2: dict
):
    """Synastry (compatibility between two people)."""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/context/synastry",
            json={
                "first_subject": user_data_1,
                "second_subject": user_data_2
            }
        )
        response.raise_for_status()
        return response.json()


async def fetch_composite_context(
    user_data_1: dict,
    user_data_2: dict
):
    """Composite chart (relationship as entity)."""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/context/composite",
            json={
                "first_subject": user_data_1,
                "second_subject": user_data_2
            }
        )
        response.raise_for_status()
        return response.json()


async def fetch_solar_return_context(
    user_data: dict,
    year: int,
    return_location: dict = None
):
    """Solar return (yearly forecast)."""

    payload = {
        "subject": user_data,
        "year": year
    }

    if return_location:
        payload["return_location"] = return_location

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/context/solar-return",
            json=payload
        )
        response.raise_for_status()
        return response.json()


async def fetch_lunar_return_context(
    user_data: dict,
    return_location: dict = None,
    year: int = None
):
    """
    Lunar return (monthly forecast).

    Astrologer API v5 requires year or iso_datetime.
    When no year is supplied by the caller, use the current year.
    """

    payload = {
        "subject": user_data,
        "year": year if year is not None else _current_year()
    }

    if return_location:
        payload["return_location"] = return_location

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/context/lunar-return",
            json=payload
        )
        response.raise_for_status()
        return response.json()


async def fetch_moon_phase_context(data: dict = None):
    """Moon phase (specific or current)."""

    async with httpx.AsyncClient() as client:

        if data:
            response = await client.post(
                f"{ASTRA_URL}/api/v5/moon-phase/context",
                json=data
            )
        else:
            response = await client.post(
                f"{ASTRA_URL}/api/v5/moon-phase/now-utc/context",
                json={}
            )

        response.raise_for_status()
        return response.json()


async def fetch_now_context():
    """Current moment (XML context)."""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/now/context",
            json={}
        )
        response.raise_for_status()
        return response.json()


# ============================================
# DATA ENDPOINTS (RAW JSON)
# ============================================

async def fetch_natal_data(user_data: dict):
    """Raw natal chart data (JSON)."""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/chart-data/birth-chart",
            json={
                "subject": user_data
            }
        )
        response.raise_for_status()
        return response.json()


async def fetch_transit_data(
    user_data: dict,
    transit_data: dict = None
):
    """Raw transit data (JSON)."""

    async with httpx.AsyncClient() as client:

        if transit_data:
            transit_subject = _normalize_transit_subject(transit_data)
        else:
            transit_subject = await _fetch_current_transit_subject(client)

        response = await client.post(
            f"{ASTRA_URL}/api/v5/chart-data/transit",
            json={
                "first_subject": user_data,
                "transit_subject": transit_subject
            }
        )

        response.raise_for_status()
        return response.json()


async def fetch_synastry_data(
    user_data_1: dict,
    user_data_2: dict
):
    """Raw synastry data (JSON)."""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/chart-data/synastry",
            json={
                "first_subject": user_data_1,
                "second_subject": user_data_2
            }
        )
        response.raise_for_status()
        return response.json()


async def fetch_composite_data(
    user_data_1: dict,
    user_data_2: dict
):
    """Raw composite chart data (JSON)."""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/chart-data/composite",
            json={
                "first_subject": user_data_1,
                "second_subject": user_data_2
            }
        )
        response.raise_for_status()
        return response.json()


async def fetch_solar_return_data(
    user_data: dict,
    year: int,
    return_location: dict = None
):
    """Raw solar return data (JSON)."""

    payload = {
        "subject": user_data,
        "year": year
    }

    if return_location:
        payload["return_location"] = return_location

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/chart-data/solar-return",
            json=payload
        )
        response.raise_for_status()
        return response.json()


async def fetch_lunar_return_data(
    user_data: dict,
    return_location: dict = None,
    year: int = None
):
    """
    Raw lunar return data (JSON).

    Astrologer API v5 requires year or iso_datetime.
    """

    payload = {
        "subject": user_data,
        "year": year if year is not None else _current_year()
    }

    if return_location:
        payload["return_location"] = return_location

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/chart-data/lunar-return",
            json=payload
        )
        response.raise_for_status()
        return response.json()


async def fetch_moon_phase_data(data: dict = None):
    """Raw moon phase data (JSON)."""

    async with httpx.AsyncClient() as client:

        if data:
            response = await client.post(
                f"{ASTRA_URL}/api/v5/moon-phase",
                json=data
            )
        else:
            response = await client.post(
                f"{ASTRA_URL}/api/v5/moon-phase/now-utc",
                json={}
            )

        response.raise_for_status()
        return response.json()


async def fetch_now_data():
    """Raw current moment data (JSON)."""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/now/subject",
            json={}
        )
        response.raise_for_status()
        return response.json()


async def fetch_subject_data(user_data: dict):
    """Raw subject data (JSON)."""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/subject",
            json={
                "subject": user_data
            }
        )
        response.raise_for_status()
        return response.json()


async def fetch_compatibility_score(
    user_data_1: dict,
    user_data_2: dict
):
    """Numerical compatibility score."""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/compatibility-score",
            json={
                "first_subject": user_data_1,
                "second_subject": user_data_2
            }
        )
        response.raise_for_status()
        return response.json()


# ============================================
# SVG ENDPOINTS (CHART + SVG)
# ============================================

async def fetch_natal_svg(
    user_data: dict,
    theme: str = "classic",
    language: str = "PT"
):
    """Natal chart with SVG."""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/chart/birth-chart",
            json={
                "subject": user_data,
                "theme": theme,
                "language": language
            }
        )
        response.raise_for_status()
        return response.json()


async def fetch_transit_svg(
    user_data: dict,
    theme: str = "classic",
    language: str = "PT",
    transit_data: dict = None
):
    """Transits with SVG."""

    async with httpx.AsyncClient() as client:

        if transit_data:
            transit_subject = _normalize_transit_subject(transit_data)
        else:
            transit_subject = await _fetch_current_transit_subject(client)

        response = await client.post(
            f"{ASTRA_URL}/api/v5/chart/transit",
            json={
                "first_subject": user_data,
                "transit_subject": transit_subject,
                "theme": theme,
                "language": language
            }
        )

        response.raise_for_status()
        return response.json()


async def fetch_synastry_svg(
    user_data_1: dict,
    user_data_2: dict,
    theme: str = "classic",
    language: str = "PT"
):
    """Synastry with SVG."""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/chart/synastry",
            json={
                "first_subject": user_data_1,
                "second_subject": user_data_2,
                "theme": theme,
                "language": language
            }
        )
        response.raise_for_status()
        return response.json()


async def fetch_composite_svg(
    user_data_1: dict,
    user_data_2: dict,
    theme: str = "classic",
    language: str = "PT"
):
    """Composite chart with SVG."""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/chart/composite",
            json={
                "first_subject": user_data_1,
                "second_subject": user_data_2,
                "theme": theme,
                "language": language
            }
        )
        response.raise_for_status()
        return response.json()


async def fetch_solar_return_svg(
    user_data: dict,
    year: int,
    theme: str = "classic",
    language: str = "PT"
):
    """Solar return with SVG."""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/chart/solar-return",
            json={
                "subject": user_data,
                "year": year,
                "theme": theme,
                "language": language
            }
        )
        response.raise_for_status()
        return response.json()


async def fetch_lunar_return_svg(
    user_data: dict,
    theme: str = "classic",
    language: str = "PT",
    year: int = None
):
    """
    Lunar return with SVG.

    Astrologer API v5 requires year or iso_datetime.
    """

    payload = {
        "subject": user_data,
        "year": year if year is not None else _current_year(),
        "theme": theme,
        "language": language
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/chart/lunar-return",
            json=payload
        )
        response.raise_for_status()
        return response.json()


async def fetch_now_svg(
    theme: str = "classic",
    language: str = "PT"
):
    """Current moment with SVG."""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ASTRA_URL}/api/v5/now/chart",
            json={
                "theme": theme,
                "language": language
            }
        )
        response.raise_for_status()
        return response.json()