from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "TradeSaathi JARVIS"
    version: str = "0.1.0"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    gemini_api_key: Optional[str] = None
    ai_model: str = "gemini-2.0-flash"

    @property
    def ai_enabled(self) -> bool:
        return bool(self.gemini_api_key)

    class Config:
        env_file = ".env"

settings = Settings()
