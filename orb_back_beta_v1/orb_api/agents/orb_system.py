# agents/orb_system.py
from agents.router import AIRouter

class OrbSystem:
    """
    Orb System - Main orchestration class.
    """
    
    def __init__(self):
        self.router = AIRouter()
    
    def chat(self, user_message: str) -> str:
        """Process user message without context."""
        return self.router.chat(user_message)
    
    def chat_with_context(self, user_message: str, context: str) -> str:
        """Process user message with context."""
        return self.router.chat_with_context(user_message, context)