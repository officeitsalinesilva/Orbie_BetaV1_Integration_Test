# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    """Test client for the API."""
    return TestClient(app)

@pytest.fixture
def sample_user_data():
    """Sample user data for tests."""
    return {
        "name": "Test User",
        "year": 1990,
        "month": 6,
        "day": 15,
        "hour": 12,
        "minute": 30,
        "city": "Sao Paulo",
        "nation": "BR",
        "timezone": "America/Sao_Paulo",
        "longitude": -46.6333,
        "latitude": -23.5505
    }

@pytest.fixture
def sample_user_data_2():
    """Sample second user data for synastry tests."""
    return {
        "name": "Test User 2",
        "year": 1988,
        "month": 1,
        "day": 20,
        "hour": 18,
        "minute": 15,
        "city": "Rio de Janeiro",
        "nation": "BR",
        "timezone": "America/Sao_Paulo",
        "longitude": -43.1729,
        "latitude": -22.9068
    }