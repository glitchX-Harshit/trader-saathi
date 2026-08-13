import time
from datetime import datetime
from app.models.schemas import TraderState, BehavioralEvent, Trade

class BehavioralEngine:
    def __init__(self):
        self.reset()

    def reset(self):
        self.state = TraderState(
            state='stable',
            confidence=1.0,
            session_pnl=0.0,
            trades_count=0,
            consecutive_losses=0,
            risk_score=100.0,
            discipline_score=100.0,
            emotional_stability_score=100.0,
            risk_control_score=100.0
        )
        self.trades = []
        self.events = []
        self.last_trade_time = None
        self.last_position_size = 0.0

    @property
    def has_data(self) -> bool:
        return self.state.trades_count > 0 or len(self.events) > 0

    def process_event(self, event_type: str, params: dict = None) -> list[BehavioralEvent]:
        params = params or {}
        new_events = []
        now = datetime.now()
        
        is_trade_open = event_type in ['trade_opened', 'rapid_reentry']
        
        # Update stats
        if is_trade_open:
            self.state.trades_count += 1
            pos_size = params.get('position_size', 1.0)
            
            # Detect rapid reentry (either naturally or forced by simulation)
            if event_type == 'rapid_reentry' or (self.last_trade_time and (now - self.last_trade_time).total_seconds() < 60):
                new_events.append(BehavioralEvent(
                    timestamp=now,
                    event_type='rapid_reentry',
                    severity='high',
                    detected_pattern='Rapid Reentry',
                    confidence=0.9
                ))

            # Detect position size increase
            if self.last_position_size > 0 and pos_size > self.last_position_size * 1.3:
                new_events.append(BehavioralEvent(
                    timestamp=now,
                    event_type='position_size_increased',
                    severity='medium',
                    detected_pattern='Position Size Increased',
                    confidence=0.8
                ))

            # Detect overtrading
            if self.state.trades_count > 5:
                new_events.append(BehavioralEvent(
                    timestamp=now,
                    event_type='overtrading',
                    severity='high',
                    detected_pattern='Overtrading',
                    confidence=0.85
                ))

            self.last_position_size = pos_size

        elif event_type == 'trade_closed_loss':
            self.state.consecutive_losses += 1
            self.last_trade_time = now
            self.state.emotional_stability_score = max(0.0, self.state.emotional_stability_score - 10.0)
            if self.state.consecutive_losses >= 2:
                new_events.append(BehavioralEvent(
                    timestamp=now,
                    event_type='consecutive_loss',
                    severity='medium',
                    detected_pattern='Consecutive Losses',
                    confidence=0.9
                ))

        elif event_type == 'trade_closed_profit':
            self.state.consecutive_losses = 0
            self.last_trade_time = now
            self.state.emotional_stability_score = min(100.0, self.state.emotional_stability_score + 5.0)

        elif event_type == 'stop_loss_moved':
            new_events.append(BehavioralEvent(
                timestamp=now,
                event_type='stop_loss_moved',
                severity='high',
                detected_pattern='Stop Loss Moved',
                confidence=0.9
            ))
            
        elif event_type == 'position_size_increased':
            new_events.append(BehavioralEvent(
                timestamp=now,
                event_type='position_size_increased',
                severity='medium',
                detected_pattern='Position Size Increased',
                confidence=0.8
            ))

        # Detect Revenge Trading Risk
        has_loss = self.state.consecutive_losses > 0
        has_rapid = any(e.event_type == 'rapid_reentry' for e in new_events)
        has_pos_increase = any(e.event_type == 'position_size_increased' for e in new_events)
        
        if has_loss and has_rapid and has_pos_increase:
            new_events.append(BehavioralEvent(
                timestamp=now,
                event_type='revenge_trading',
                severity='critical',
                detected_pattern='Revenge Trading Risk',
                confidence=0.95
            ))

        # Update State Transitions and Scores
        self._update_scores(new_events)
        if new_events:
            self._update_state(new_events)

        self.events.extend(new_events)
        return new_events

    def _update_scores(self, new_events):
        max_confidence = 1.0
        for e in new_events:
            max_confidence = min(max_confidence, e.confidence)
            if e.event_type == 'rapid_reentry':
                self.state.discipline_score -= 15.0
            elif e.event_type == 'revenge_trading':
                self.state.discipline_score -= 20.0
                self.state.emotional_stability_score -= 25.0
                self.state.risk_control_score -= 15.0
            elif e.event_type == 'stop_loss_moved':
                self.state.discipline_score -= 10.0
                self.state.risk_control_score -= 20.0
            elif e.event_type == 'overtrading':
                self.state.discipline_score -= 10.0
            elif e.event_type == 'position_size_increased':
                self.state.risk_control_score -= 15.0

        self.state.discipline_score = max(0.0, self.state.discipline_score)
        self.state.emotional_stability_score = max(0.0, self.state.emotional_stability_score)
        self.state.risk_control_score = max(0.0, self.state.risk_control_score)
        
        self.state.risk_score = (self.state.discipline_score + self.state.emotional_stability_score + self.state.risk_control_score) / 3.0
        
        if new_events:
            self.state.confidence = max_confidence

    def _update_state(self, new_events):
        has_critical = any(e.severity == 'critical' for e in new_events)
        has_high = any(e.severity == 'high' for e in new_events)
        has_medium = any(e.severity == 'medium' for e in new_events)

        if has_critical:
            self.state.state = 'revenge_risk'
        elif self.state.state == 'elevated' and (has_high or has_medium):
            self.state.state = 'impulsive'
        elif self.state.state == 'stable' and (has_medium or has_high):
            self.state.state = 'elevated'

    def get_state(self) -> TraderState:
        return self.state
