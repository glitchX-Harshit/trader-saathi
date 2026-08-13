from fastapi import APIRouter
from datetime import datetime
import uuid
from app.models.schemas import SessionState, SimulateEventRequest
from app.behavior.engine import BehavioralEngine
from app.services.jarvis import JarvisResponseEngine
from app.mock.trading import MockTradingEngine

router = APIRouter()

# Global instances for simplicity in this architecture
behavioral_engine = BehavioralEngine()
jarvis_engine = JarvisResponseEngine()
mock_trading = MockTradingEngine()
session_id = str(uuid.uuid4())
session_start = datetime.now()
jarvis_messages = []
conversation_history = []

@router.get("/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}

@router.get("/session", response_model=SessionState)
async def get_session():
    return SessionState(
        session_id=session_id,
        started_at=session_start,
        trader_state=behavioral_engine.get_state(),
        trades=mock_trading.trades + ([mock_trading.current_trade] if mock_trading.current_trade else []),
        events=behavioral_engine.events,
        jarvis_messages=jarvis_messages,
        current_observation=mock_trading.get_current_observation()
    )

@router.post("/simulate/event")
async def simulate_event(request: SimulateEventRequest):
    # 1. Simulate the market/trading event
    mock_result = mock_trading.simulate_event(request.event_type, request.params)
    
    # Update PnL after closing a trade
    if request.event_type in ['trade_closed_loss', 'trade_closed_profit']:
        behavioral_engine.state.session_pnl = mock_trading.session_pnl

    # 2. Process through behavioral engine
    new_events = behavioral_engine.process_event(request.event_type, request.params)
    
    # 3. Generate Jarvis response
    jarvis_msg = await jarvis_engine.generate_response(
        new_events, 
        behavioral_engine.get_state(), 
        {"event_type": request.event_type, "trade": mock_result.get("trade")},
        conversation_history
    )
    
    if jarvis_msg:
        jarvis_messages.append(jarvis_msg)
        conversation_history.append({"role": "model", "content": jarvis_msg.message})
        
    return {
        "trade": mock_result.get("trade"),
        "behavioral_events": new_events,
        "trader_state": behavioral_engine.get_state(),
        "jarvis_message": jarvis_msg,
        "observation": mock_result.get("observation")
    }

@router.post("/session/reset", response_model=SessionState)
async def reset_session():
    global session_id, session_start, jarvis_messages, conversation_history
    
    behavioral_engine.reset()
    mock_trading.reset()
    session_id = str(uuid.uuid4())
    session_start = datetime.now()
    jarvis_messages = []
    conversation_history = []
    
    return await get_session()
