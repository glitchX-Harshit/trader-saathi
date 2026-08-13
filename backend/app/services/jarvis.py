import uuid
import json
from datetime import datetime
from app.models.schemas import JarvisMessage, TraderState, BehavioralEvent
from app.services.ai_provider import get_ai_provider

JARVIS_SYSTEM_PROMPT = """
You are JARVIS, an AI behavioral trading companion built into TradeSaathi.

Your mission: Help the trader maintain discipline and recognize dangerous behavioral patterns while trading.

Rules:
- Never claim certainty about the trader's emotions. Describe observable behavioral patterns.
- Never guarantee a profitable trade or invent market information.
- Never place or recommend automatic trades.
- If the trader shows signs of impulsive behavior, intervene clearly and explain WHY.
- Be calm, concise, confident, slightly witty, professional, respectful, and non-judgmental.
- Do not talk continuously. Speak only when there is meaningful context.
- Keep responses under 3 sentences for routine observations, up to 5 sentences for interventions.
"""

class JarvisResponseEngine:
    def __init__(self):
        self.ai_provider = get_ai_provider()

    async def generate_response(self, behavioral_events: list[BehavioralEvent], trader_state: TraderState, trade_context: dict, conversation_history: list = None) -> JarvisMessage:
        if self.ai_provider:
            ai_msg = await self.generate_ai_response(behavioral_events, trader_state, trade_context, conversation_history)
            if ai_msg:
                return ai_msg
        
        return self.generate_rule_based_response(behavioral_events, trader_state, trade_context)

    async def generate_ai_response(self, behavioral_events: list[BehavioralEvent], trader_state: TraderState, trade_context: dict, conversation_history: list = None) -> JarvisMessage:
        try:
            state_dict = trader_state.dict() if hasattr(trader_state, 'dict') else trader_state
            events_dict = [e.dict() if hasattr(e, 'dict') else e for e in behavioral_events]
            
            user_prompt = f"""
Current Trading State: {json.dumps(state_dict)}
Recent Behavioral Events: {json.dumps(events_dict)}
Trade Context: {json.dumps(trade_context)}
"""
            if conversation_history:
                user_prompt += f"\nConversation History: {json.dumps(conversation_history[-5:])}"
            
            response_text = await self.ai_provider.generate_response(JARVIS_SYSTEM_PROMPT, user_prompt)
            if not response_text:
                return None
            
            severity = "medium"
            if any(e.event_type in ['revenge_trading', 'consecutive_loss'] for e in behavioral_events) or (hasattr(trader_state, 'detected_state') and trader_state.detected_state in ['revenge_trading', 'tilted']):
                severity = "critical"
            
            msg_type = "intervention" if severity == "critical" else "informational"
            
            return JarvisMessage(
                id=str(uuid.uuid4()),
                timestamp=datetime.now(),
                message=response_text.strip(),
                message_type=msg_type,
                severity=severity,
                speak=severity == "critical"
            )
        except Exception as e:
            print(f"AI response generation failed: {e}")
            return None

    async def handle_user_message(self, text: str, trader_state: TraderState, session_context: dict, conversation_history: list = None) -> JarvisMessage:
        if not self.ai_provider:
            return JarvisMessage(
                id=str(uuid.uuid4()),
                timestamp=datetime.now(),
                message="I am currently operating in rule-based mode and cannot process conversational input.",
                message_type="informational",
                severity="low",
                speak=False
            )
        
        try:
            state_dict = trader_state.dict() if hasattr(trader_state, 'dict') else trader_state
            
            user_prompt = f"""
User says: "{text}"

Current Trading State: {json.dumps(state_dict)}
Session Context: {json.dumps(session_context)}
"""
            if conversation_history:
                user_prompt += f"\nConversation History: {json.dumps(conversation_history[-5:])}"
            
            response_text = await self.ai_provider.generate_response(JARVIS_SYSTEM_PROMPT, user_prompt)
            
            if response_text:
                return JarvisMessage(
                    id=str(uuid.uuid4()),
                    timestamp=datetime.now(),
                    message=response_text.strip(),
                    message_type="informational",
                    severity="low",
                    speak=False
                )
        except Exception as e:
            print(f"AI handle user message failed: {e}")
            
        return JarvisMessage(
            id=str(uuid.uuid4()),
            timestamp=datetime.now(),
            message="I'm sorry, I couldn't process your message.",
            message_type="informational",
            severity="low",
            speak=False
        )

    def generate_rule_based_response(self, behavioral_events: list[BehavioralEvent], trader_state: TraderState, trade_context: dict) -> JarvisMessage:
        if not behavioral_events:
            event_type = trade_context.get('event_type')
            if event_type == 'trade_opened':
                return JarvisMessage(
                    id=str(uuid.uuid4()),
                    timestamp=datetime.now(),
                    message="I'm monitoring your position. Your risk parameters are set.",
                    message_type="informational",
                    severity="low",
                    speak=False
                )
            elif event_type == 'trade_closed_loss':
                return JarvisMessage(
                    id=str(uuid.uuid4()),
                    timestamp=datetime.now(),
                    message="The trade closed at a loss. Your original risk was respected. Give yourself a moment before evaluating another setup.",
                    message_type="post_trade",
                    severity="medium",
                    speak=False
                )
            return None

        # Prioritize the most severe event
        critical_events = [e for e in behavioral_events if getattr(e, 'event_type', None) == 'revenge_trading']
        if critical_events:
            return JarvisMessage(
                id=str(uuid.uuid4()),
                timestamp=datetime.now(),
                message="Pause. Your current behavior is significantly different from your normal trading pattern. You entered only a few seconds after the loss and increased your position size. This resembles a revenge-trading pattern. I recommend stepping away before taking another position.",
                message_type="intervention",
                severity="critical",
                speak=True
            )

        consec_loss_events = [e for e in behavioral_events if getattr(e, 'event_type', None) == 'consecutive_loss']
        if consec_loss_events:
            return JarvisMessage(
                id=str(uuid.uuid4()),
                timestamp=datetime.now(),
                message=f"That's {getattr(trader_state, 'consecutive_losses', 0)} consecutive losses. Don't try to recover it immediately. Protecting your decision-making process is more important than recovering this trade.",
                message_type="behavioral",
                severity="high",
                speak=True
            )
            
        pos_increase_events = [e for e in behavioral_events if getattr(e, 'event_type', None) == 'position_size_increased']
        if pos_increase_events:
            return JarvisMessage(
                id=str(uuid.uuid4()),
                timestamp=datetime.now(),
                message="I noticed your position size is significantly larger than your normal trade. Consider whether this aligns with your risk management plan.",
                message_type="warning",
                severity="medium",
                speak=False
            )
            
        sl_moved_events = [e for e in behavioral_events if getattr(e, 'event_type', None) == 'stop_loss_moved']
        if sl_moved_events:
            return JarvisMessage(
                id=str(uuid.uuid4()),
                timestamp=datetime.now(),
                message="You've widened your stop loss. This changes your original risk parameters. Make sure this adjustment is based on analysis, not hope.",
                message_type="behavioral",
                severity="high",
                speak=True
            )
            
        return None
