import uuid
import random
from datetime import datetime
from app.models.schemas import CurrentObservation, Trade

class MockTradingEngine:
    def __init__(self):
        self.reset()

    def reset(self):
        self.current_observation = CurrentObservation(
            platform="Mock Broker",
            instrument=None,
            position=None,
            direction=None,
            entry=None,
            stop_loss=None,
            take_profit=None,
            unrealized_pnl=None
        )
        self.session_pnl = 0.0
        self.current_trade = None
        self.trades = []

    def simulate_event(self, event_type: str, params: dict = None) -> dict:
        params = params or {}
        trade_event = None
        
        if event_type == 'trade_opened':
            instruments = ["NIFTY", "BANKNIFTY", "RELIANCE", "TATAMOTORS", "INFY"]
            instrument = params.get('instrument', random.choice(instruments))
            entry_price = random.uniform(100, 20000)
            position_size = params.get('position_size', 1.0)
            direction = random.choice(["long", "short"])
            
            sl_dist = entry_price * 0.01
            tp_dist = entry_price * 0.02
            
            if direction == "long":
                stop_loss = entry_price - sl_dist
                take_profit = entry_price + tp_dist
            else:
                stop_loss = entry_price + sl_dist
                take_profit = entry_price - tp_dist
                
            self.current_trade = Trade(
                id=str(uuid.uuid4()),
                symbol=instrument,
                direction=direction,
                entry_price=entry_price,
                position_size=position_size,
                stop_loss=stop_loss,
                take_profit=take_profit,
                opened_at=datetime.now(),
                result="open"
            )
            
            self.current_observation.instrument = instrument
            self.current_observation.position = position_size
            self.current_observation.direction = direction
            self.current_observation.entry = entry_price
            self.current_observation.stop_loss = stop_loss
            self.current_observation.take_profit = take_profit
            self.current_observation.unrealized_pnl = 0.0
            
            trade_event = self.current_trade
            
        elif event_type in ['trade_closed_profit', 'trade_closed_loss', 'stop_loss_hit', 'take_profit_hit']:
            if self.current_trade:
                if event_type == 'trade_closed_profit' or event_type == 'take_profit_hit':
                    pnl = random.uniform(200, 2000)
                    self.current_trade.exit_price = self.current_trade.take_profit
                    self.current_trade.result = "win"
                else:
                    pnl = random.uniform(-2000, -200)
                    self.current_trade.exit_price = self.current_trade.stop_loss
                    self.current_trade.result = "loss"
                    
                self.current_trade.pnl = pnl
                self.current_trade.closed_at = datetime.now()
                self.session_pnl += pnl
                self.trades.append(self.current_trade)
                trade_event = self.current_trade
                
                self.current_trade = None
                self.current_observation.instrument = None
                self.current_observation.position = None
                self.current_observation.direction = None
                self.current_observation.entry = None
                self.current_observation.stop_loss = None
                self.current_observation.take_profit = None
                self.current_observation.unrealized_pnl = None

        elif event_type == 'position_size_increased' and self.current_trade:
            self.current_trade.position_size *= random.uniform(1.5, 2.0)
            self.current_observation.position = self.current_trade.position_size
            
        elif event_type == 'stop_loss_moved' and self.current_trade:
            sl_change = self.current_trade.entry_price * random.uniform(0.005, 0.02)
            if self.current_trade.direction == "long":
                self.current_trade.stop_loss -= sl_change
            else:
                self.current_trade.stop_loss += sl_change
            self.current_observation.stop_loss = self.current_trade.stop_loss
            
        elif event_type == 'rapid_reentry':
            self.simulate_event('trade_opened', params)
            trade_event = self.current_trade
            
        elif event_type == 'consecutive_loss':
            self.simulate_event('trade_closed_loss', params)
            trade_event = self.trades[-1] if self.trades else None

        return {
            "trade": trade_event,
            "observation": self.current_observation
        }

    def get_current_observation(self) -> CurrentObservation:
        return self.current_observation
        
    def get_session_pnl(self) -> float:
        return self.session_pnl
