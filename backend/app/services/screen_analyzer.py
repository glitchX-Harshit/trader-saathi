import json
from app.services.ai_provider import get_ai_provider

class ScreenAnalyzer:
    def __init__(self):
        self.ai_provider = get_ai_provider()

    async def analyze_screen(self, image_base64: str) -> dict:
        if not self.ai_provider:
            return {
                "platform": None,
                "instrument": None,
                "position": None,
                "entry_price": None,
                "current_price": None,
                "stop_loss": None,
                "take_profit": None,
                "pnl": None,
                "confidence": 0.0,
                "error": "AI provider not available"
            }
        
        system_prompt = """
You are an expert trading screen analyzer. Your job is to extract structured data from screenshots of trading platforms (like TradingView, MetaTrader, Binance, etc.).
Extract the following information if visible:
- platform: name of the trading platform
- instrument: the trading pair or ticker (e.g. BTCUSD, AAPL, EURUSD)
- position: long or short (or None if no open position)
- entry_price: the entry price of the open position (number or None)
- current_price: the current market price (number or None)
- stop_loss: the stop loss price (number or None)
- take_profit: the take profit price (number or None)
- pnl: the current unrealized profit/loss (number or None)
- confidence: your confidence in the extracted data from 0.0 to 1.0

Return the data ONLY as a valid JSON object. Do not include markdown formatting or explanations.
"""
        user_prompt = "Analyze this trading screen and return the structured JSON data."
        
        try:
            response_text = await self.ai_provider.analyze_image(system_prompt, image_base64, user_prompt)
            if response_text:
                # Clean up potential markdown formatting in response
                cleaned_text = response_text.strip()
                if cleaned_text.startswith("```json"):
                    cleaned_text = cleaned_text[7:]
                if cleaned_text.startswith("```"):
                    cleaned_text = cleaned_text[3:]
                if cleaned_text.endswith("```"):
                    cleaned_text = cleaned_text[:-3]
                cleaned_text = cleaned_text.strip()
                
                data = json.loads(cleaned_text)
                return data
        except Exception as e:
            print(f"Screen analysis failed: {e}")
            
        return {
            "platform": None,
            "instrument": None,
            "position": None,
            "entry_price": None,
            "current_price": None,
            "stop_loss": None,
            "take_profit": None,
            "pnl": None,
            "confidence": 0.0,
            "error": "Analysis failed"
        }

screen_analyzer = ScreenAnalyzer()
