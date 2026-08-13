from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class Trade(BaseModel):
    id: str
    symbol: str
    direction: str
    entry_price: float
    exit_price: Optional[float] = None
    position_size: float
    stop_loss: float
    take_profit: float
    pnl: Optional[float] = None
    opened_at: datetime
    closed_at: Optional[datetime] = None
    result: str

class BehavioralEvent(BaseModel):
    timestamp: datetime
    event_type: str
    severity: str
    detected_pattern: str
    confidence: float

class TraderState(BaseModel):
    state: str
    confidence: float
    session_pnl: float
    trades_count: int
    consecutive_losses: int
    risk_score: float
    discipline_score: float
    emotional_stability_score: float
    risk_control_score: float

class SimulateEventRequest(BaseModel):
    event_type: str
    params: Optional[Dict[str, Any]] = None

class JarvisMessage(BaseModel):
    id: str
    timestamp: datetime
    message: str
    message_type: str
    severity: str
    speak: bool

class CurrentObservation(BaseModel):
    platform: str
    instrument: Optional[str] = None
    position: Optional[float] = None
    direction: Optional[str] = None
    entry: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    unrealized_pnl: Optional[float] = None

class SessionState(BaseModel):
    session_id: str
    started_at: datetime
    trader_state: TraderState
    trades: List[Trade]
    events: List[BehavioralEvent]
    jarvis_messages: List[JarvisMessage]
    current_observation: CurrentObservation
