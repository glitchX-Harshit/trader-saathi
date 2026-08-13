import json
from abc import ABC, abstractmethod
from typing import Optional
from app.core.config import settings

class AIProvider(ABC):
    @abstractmethod
    async def generate_response(self, system_prompt: str, user_prompt: str) -> str:
        pass
    
    @abstractmethod
    async def analyze_image(self, system_prompt: str, image_base64: str, prompt: str) -> str:
        pass

class GeminiProvider(AIProvider):
    def __init__(self):
        from google import genai
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.model = settings.ai_model
    
    async def generate_response(self, system_prompt: str, user_prompt: str) -> str:
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=user_prompt,
                config={
                    'system_instruction': system_prompt,
                    'temperature': 0.7,
                    'max_output_tokens': 300
                }
            )
            return response.text
        except Exception as e:
            print(f"Gemini API error: {e}")
            return None
    
    async def analyze_image(self, system_prompt: str, image_base64: str, prompt: str) -> str:
        try:
            import base64
            image_bytes = base64.b64decode(image_base64)
            response = self.client.models.generate_content(
                model=self.model,
                contents=[
                    {'inline_data': {'mime_type': 'image/png', 'data': image_base64}},
                    prompt
                ],
                config={
                    'system_instruction': system_prompt,
                    'temperature': 0.3,
                    'max_output_tokens': 500
                }
            )
            return response.text
        except Exception as e:
            print(f"Gemini Vision API error: {e}")
            return None

def get_ai_provider() -> Optional[AIProvider]:
    if settings.gemini_api_key:
        try:
            return GeminiProvider()
        except Exception as e:
            print(f"Failed to initialize AI provider: {e}")
    return None
