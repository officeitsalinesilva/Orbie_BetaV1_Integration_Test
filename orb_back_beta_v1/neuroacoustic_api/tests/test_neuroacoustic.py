import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestNeuroacousticAPI:
    """Testes para a Neuroacoustic API."""
    
    def test_catalog_list(self):
        response = client.get("/catalog")
        assert response.status_code == 200
        data = response.json()
        assert "presets" in data
        print(f"✅ Catálogo: {len(data['presets'])} presets")
    
    def test_generate_tone_sine(self):
        response = client.post(
            "/generate/tone",
            json={"frequency": 432, "duration": 2, "waveform": "sine", "format": "wav"}
        )
        assert response.status_code == 200
        assert len(response.content) > 0
        print("✅ Tom Sine OK")
    
    def test_generate_binaural(self):
        response = client.post(
            "/generate/binaural",
            json={"left_frequency": 200, "right_frequency": 208, "duration": 3}
        )
        assert response.status_code == 200
        assert len(response.content) > 0
        print("✅ Binaural OK")
    
    def test_generate_noise(self):
        response = client.post(
            "/generate/noise",
            json={"noise_type": "white", "duration": 2}
        )
        assert response.status_code == 200
        assert len(response.content) > 0
        print("✅ Ruído branco OK")
    
    def test_health(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "OK"
        print("✅ Health check OK")