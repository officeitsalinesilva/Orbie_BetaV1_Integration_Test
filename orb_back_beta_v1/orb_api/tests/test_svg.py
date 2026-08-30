# tests/test_svg.py
import pytest

def test_svg_natal(client, sample_user_data):
    """Test natal chart SVG endpoint."""
    response = client.post(
        "/svg/natal",
        json={
            "user_data": sample_user_data,
            "theme": "dark",
            "language": "PT"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "chart" in data
    assert data["chart"].startswith("<svg") or data["chart"].startswith("<?xml")
    print("✅ SVG Natal OK")

def test_svg_transits(client, sample_user_data):
    """Test transits SVG endpoint."""
    response = client.post(
        "/svg/transits",
        json={
            "user_data": sample_user_data,
            "theme": "dark",
            "language": "PT"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "chart" in data
    print("✅ SVG Transits OK")

def test_svg_synastry(client, sample_user_data, sample_user_data_2):
    """Test synastry SVG endpoint."""
    response = client.post(
        "/svg/synastry",
        json={
            "user_data_1": sample_user_data,
            "user_data_2": sample_user_data_2,
            "theme": "dark",
            "language": "PT"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "chart" in data
    print("✅ SVG Synastry OK")

def test_svg_composite(client, sample_user_data, sample_user_data_2):
    """Test composite SVG endpoint."""
    response = client.post(
        "/svg/composite",
        json={
            "user_data_1": sample_user_data,
            "user_data_2": sample_user_data_2,
            "theme": "dark",
            "language": "PT"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "chart" in data
    print("✅ SVG Composite OK")

def test_svg_solar_return(client, sample_user_data):
    """Test solar return SVG endpoint."""
    response = client.post(
        "/svg/solar-return",
        json={
            "user_data": sample_user_data,
            "year": 2026,
            "theme": "dark",
            "language": "PT"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "chart" in data
    print("✅ SVG Solar Return OK")

def test_svg_lunar_return(client, sample_user_data):
    """Test lunar return SVG endpoint."""
    response = client.post(
        "/svg/lunar-return",
        json={
            "user_data": sample_user_data,
            "theme": "dark",
            "language": "PT"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "chart" in data
    print("✅ SVG Lunar Return OK")

def test_svg_now(client):
    """Test current moment SVG endpoint."""
    response = client.post(
        "/svg/now",
        json={
            "theme": "dark",
            "language": "PT"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "chart" in data
    print("✅ SVG Now OK")