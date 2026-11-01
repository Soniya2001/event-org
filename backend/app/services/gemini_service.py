import os
import json
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

# Check if google-genai is available
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    logger.warning("google-genai package not found. AI service will operate with smart domain fallback.")

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        self.model = settings.GEMINI_MODEL
        self.client = None
        if self.api_key and GENAI_AVAILABLE:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize Gemini client: {e}")

    def generate_structured_json(self, prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        """
        Calls Gemini API requesting strict JSON output.
        If API key is missing or call fails, returns None so caller can use smart deterministic fallback.
        """
        if not self.client or not self.api_key:
            logger.info("No Gemini API key configured. Utilizing high-fidelity AI domain generator.")
            return None

        try:
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.4,
                system_instruction=system_instruction
            )
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=config
            )
            raw_text = response.text.strip()
            # In case model wraps in markdown code fences
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            return json.loads(raw_text.strip())
        except Exception as e:
            logger.error(f"Error querying Gemini API: {e}")
            return None

    def generate_chat_response(self, system_prompt: str, conversation_history: list[dict], current_message: str) -> Optional[str]:
        if not self.client or not self.api_key:
            return None
        
        try:
            full_prompt = f"System Context:\n{system_prompt}\n\nRecent History:\n"
            for item in conversation_history[-6:]:
                full_prompt += f"{item.get('role', 'user')}: {item.get('message', '')}\n"
            full_prompt += f"user: {current_message}\nassistant:"

            response = self.client.models.generate_content(
                model=self.model,
                contents=full_prompt,
                config=types.GenerateContentConfig(temperature=0.7)
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Error during Gemini chat generation: {e}")
            return None

gemini_client = GeminiService()

