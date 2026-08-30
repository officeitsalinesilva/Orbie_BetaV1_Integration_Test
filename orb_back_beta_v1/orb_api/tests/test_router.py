# tests/test_router.py
import pytest
from app.config import config

def test_router_initialization():
    """Test router initialization."""
    from agents.router import AIRouter
    router = AIRouter()
    assert router is not None
    assert len(router.api_keys) > 0
    print(f"✅ Router initialized with {len(router.api_keys)} keys")

def test_router_chat():
    """Test router with simple message."""
    from agents.router import AIRouter
    router = AIRouter()
    response = router.chat("Tell me 3 qualities of a good assistant.")
    assert response is not None
    assert len(response) > 0
    print("✅ Router Chat OK")

def test_router_chat_with_context():
    """Test router with context."""
    from agents.router import AIRouter
    router = AIRouter()
    context = """
    User: Test User
    Birth: 15/06/1990
    Ascendant: Libra
    """
    response = router.chat_with_context(
        "What does my chart say about my career?",
        context
    )
    assert response is not None
    assert len(response) > 0
    print("✅ Router Chat with Context OK")