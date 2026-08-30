import pytest

def test_chat_natal(client, sample_user_data):
    """Test natal chat endpoint."""
    response = client.post(
        "/chat",
        json={
            "message": "What does my chart say about my personality?",
            "user_data": sample_user_data
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert isinstance(data["response"], str)
    assert len(data["response"]) > 0
    print("✅ Chat Natal OK")


def test_chat_natal_sidereal(client, sample_user_data):
    """Test chat natal with sidereal system."""
    response = client.post(
        "/chat",
        json={
            "message": "What does my chart say about my personality?",
            "user_data": sample_user_data,
            "zodiac_type": "Sidereal",
            "sidereal_mode": "LAHIRI"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    print("✅ Chat Natal (Sidereal) OK")


def test_chat_transits(client, sample_user_data):
    """Test transits endpoint."""
    response = client.post(
        "/chat/transits",
        json={
            "message": "What do current transits say about my life?",
            "user_data": sample_user_data
        }
    )

    # DEBUG TEMPORÁRIO: mostra a exceção real devolvida pela API
    print("\n" + "=" * 60)
    print("TRANSITS DEBUG")
    print("STATUS:", response.status_code)
    print("BODY:", response.text)
    print("=" * 60)

    assert response.status_code == 200

    data = response.json()
    assert "response" in data
    print("✅ Chat Transits OK")


def test_chat_synastry(client, sample_user_data, sample_user_data_2):
    """Test synastry endpoint."""
    response = client.post(
        "/chat/synastry",
        json={
            "message": "What is the compatibility between these two people?",
            "user_data_1": sample_user_data,
            "user_data_2": sample_user_data_2
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    print("✅ Chat Synastry OK")


def test_chat_composite(client, sample_user_data, sample_user_data_2):
    """Test composite chart endpoint."""
    response = client.post(
        "/chat/composite",
        json={
            "message": "What is our relationship as a whole?",
            "user_data_1": sample_user_data,
            "user_data_2": sample_user_data_2
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    print("✅ Chat Composite OK")


def test_chat_solar_return(client, sample_user_data):
    """Test solar return endpoint."""
    response = client.post(
        "/chat/solar-return",
        json={
            "message": "What will my year 2026 be like?",
            "user_data": sample_user_data,
            "year": 2026
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    print("✅ Chat Solar Return OK")


def test_chat_lunar_return(client, sample_user_data):
    """Test lunar return endpoint."""
    response = client.post(
        "/chat/lunar-return",
        json={
            "message": "What will my month be like?",
            "user_data": sample_user_data
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    print("✅ Chat Lunar Return OK")


def test_chat_moon_phase(client):
    """Test moon phase endpoint."""
    response = client.post(
        "/chat/moon-phase",
        json={
            "message": "What does today's moon say about my mood?"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    print("✅ Chat Moon Phase OK")


def test_chat_now(client):
    """Test current moment endpoint."""
    response = client.post(
        "/chat/now",
        json={
            "message": "What does today's sky say about my day?"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    print("✅ Chat Now OK")


def test_chat_without_user_data(client):
    """Test chat without user data."""
    response = client.post(
        "/chat",
        json={
            "message": "What can you tell me?"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    print("✅ Chat Without Data OK")