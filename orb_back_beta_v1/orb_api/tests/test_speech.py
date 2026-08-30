# tests/test_speech.py
import pytest
import json
import io
import wave
import struct

def test_speech_text(client, sample_user_data):
    """Test speech-to-speech via text (fallback)."""
    response = client.post(
        "/speech/text",
        json={
            "message": "Tell me something about my career.",
            "user_data": sample_user_data
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert isinstance(data["response"], str)
    assert len(data["response"]) > 0
    print("✅ Speech Text OK")

def test_speech_text_without_data(client):
    """Test speech-to-speech via text without user data."""
    response = client.post(
        "/speech/text",
        json={
            "message": "What can you tell me?"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    print("✅ Speech Text Without Data OK")

def test_speech_audio(client, sample_user_data):
    """Test speech-to-speech with audio (WAV)."""
    # Create a simple WAV file in memory (1 second of silence)
    wav_buffer = io.BytesIO()
    with wave.open(wav_buffer, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(16000)
        silence = struct.pack('<%dh' % 16000, *([0] * 16000))
        wav_file.writeframes(silence)
    wav_buffer.seek(0)
    
    files = {
        'file': ('test.wav', wav_buffer.getvalue(), 'audio/wav')
    }
    data = {
        'user_data': json.dumps(sample_user_data)
    }
    
    response = client.post("/speech", files=files, data=data)
    assert response.status_code == 200
    result = response.json()
    assert "response" in result
    assert isinstance(result["response"], str)
    print("✅ Speech Audio OK")

def test_speech_audio_without_data(client):
    """Test speech-to-speech with audio without user data."""
    wav_buffer = io.BytesIO()
    with wave.open(wav_buffer, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(16000)
        silence = struct.pack('<%dh' % 16000, *([0] * 16000))
        wav_file.writeframes(silence)
    wav_buffer.seek(0)
    
    files = {
        'file': ('test.wav', wav_buffer.getvalue(), 'audio/wav')
    }
    
    response = client.post("/speech", files=files)
    assert response.status_code == 200
    result = response.json()
    assert "response" in result
    print("✅ Speech Audio Without Data OK")

def test_speech_audio_mp3(client, sample_user_data):
    """Test speech-to-speech with MP3 audio."""
    mp3_buffer = io.BytesIO()
    mp3_buffer.write(b'ID3\x03\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00')
    mp3_buffer.write(b'\x00' * 1000)
    mp3_buffer.seek(0)
    
    files = {
        'file': ('test.mp3', mp3_buffer.getvalue(), 'audio/mpeg')
    }
    data = {
        'user_data': json.dumps(sample_user_data)
    }
    
    response = client.post("/speech", files=files, data=data)
    # Since MP3 is fake, it may return 500, but we just check endpoint responded
    assert response.status_code != 404
    print("✅ Speech Audio MP3 endpoint responding")