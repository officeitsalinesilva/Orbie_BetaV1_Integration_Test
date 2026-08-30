# tests/test_data.py
import pytest

def test_data_natal(client, sample_user_data):
    """Test raw natal data endpoint."""
    response = client.post(
        "/data/natal",
        json={
            "message": "",
            "user_data": sample_user_data
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "OK"
    print("✅ Data Natal OK")

def test_data_transits(client, sample_user_data):
    """Test raw transit data endpoint."""
    response = client.post(
        "/data/transits",
        json={
            "message": "",
            "user_data": sample_user_data
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    print("✅ Data Transits OK")

def test_data_synastry(client, sample_user_data, sample_user_data_2):
    """Test raw synastry data endpoint."""
    response = client.post(
        "/data/synastry",
        json={
            "message": "",
            "user_data_1": sample_user_data,
            "user_data_2": sample_user_data_2
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    print("✅ Data Synastry OK")

def test_data_composite(client, sample_user_data, sample_user_data_2):
    """Test raw composite data endpoint."""
    response = client.post(
        "/data/composite",
        json={
            "message": "",
            "user_data_1": sample_user_data,
            "user_data_2": sample_user_data_2
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    print("✅ Data Composite OK")

def test_data_solar_return(client, sample_user_data):
    """Test raw solar return data endpoint."""
    response = client.post(
        "/data/solar-return",
        json={
            "message": "",
            "user_data": sample_user_data,
            "year": 2026
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    print("✅ Data Solar Return OK")

def test_data_lunar_return(client, sample_user_data):
    """Test raw lunar return data endpoint - NO 'year' field."""
    response = client.post(
        "/data/lunar-return",
        json={
            "message": "",
            "user_data": sample_user_data
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    print("✅ Data Lunar Return OK")

def test_data_moon_phase(client):
    """Test raw moon phase data endpoint."""
    response = client.post(
        "/data/moon-phase",
        json={
            "message": "",
            "data": None
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    print("✅ Data Moon Phase OK")

def test_data_now(client):
    """Test raw current moment data endpoint."""
    response = client.post("/data/now", json={})
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    print("✅ Data Now OK")

def test_data_subject(client, sample_user_data):
    """Test raw subject data endpoint."""
    response = client.post(
        "/data/subject",
        json={
            "message": "",
            "user_data": sample_user_data
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    print("✅ Data Subject OK")

def test_data_compatibility_score(client, sample_user_data, sample_user_data_2):
    """Test compatibility score endpoint."""
    response = client.post(
        "/data/compatibility-score",
        json={
            "message": "",
            "user_data_1": sample_user_data,
            "user_data_2": sample_user_data_2
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert isinstance(data["score"], (int, float))
    print(f"✅ Data Compatibility Score: {data['score']}")