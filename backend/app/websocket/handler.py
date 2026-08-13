import json
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
from app.api.routes import get_session, simulate_event, reset_session, jarvis_engine, conversation_history, behavioral_engine
from app.models.schemas import SimulateEventRequest
from app.services.screen_analyzer import screen_analyzer

router = APIRouter()

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

async def send_json_safe(ws: WebSocket, data: dict):
    """Send JSON data over websocket with datetime support."""
    text = json.dumps(data, default=json_serial)
    await ws.send_text(text)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Send initial state
        session_state = await get_session()
        await send_json_safe(websocket, {
            "type": "session_update",
            "data": session_state.dict(exclude_none=True)
        })

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await send_json_safe(connection, message)
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                msg_type = message.get("type")
                
                event_map = {
                    'simulate_trade': 'trade_opened',
                    'simulate_loss': 'trade_closed_loss',
                    'simulate_profit': 'trade_closed_profit',
                    'simulate_reentry': 'rapid_reentry',
                    'simulate_position_change': 'position_size_increased',
                    'simulate_stop_loss_moved': 'stop_loss_moved'
                }

                if msg_type in event_map:
                    req = SimulateEventRequest(event_type=event_map[msg_type], params=message.get("data", {}))
                    result = await simulate_event(req)
                    
                    # Broadcast updates
                    await manager.broadcast({
                        "type": "trading_state_update",
                        "data": result["observation"].dict(exclude_none=True)
                    })
                    state_data = result["trader_state"].dict(exclude_none=True)
                    state_data["has_data"] = behavioral_engine.has_data
                    await manager.broadcast({
                        "type": "behavioral_state_update",
                        "data": state_data
                    })
                    
                    if result.get("behavioral_events"):
                        for evt in result["behavioral_events"]:
                            await manager.broadcast({
                                "type": "event_logged",
                                "data": evt.dict(exclude_none=True)
                            })

                    if result["jarvis_message"]:
                        await manager.broadcast({
                            "type": "jarvis_message",
                            "data": result["jarvis_message"].dict(exclude_none=True)
                        })

                elif msg_type == 'simulate_revenge_trade':
                    # Sequence: open trade (if none), close with loss, rapid reentry with 1.8x size
                    session = await get_session()
                    has_open_trade = session.current_observation and session.current_observation.position is not None
                    
                    if not has_open_trade:
                        await simulate_event(SimulateEventRequest(event_type='trade_opened', params={'position_size': 1.0}))
                    
                    await simulate_event(SimulateEventRequest(event_type='trade_closed_loss', params={}))
                    
                    result = await simulate_event(SimulateEventRequest(event_type='rapid_reentry', params={'position_size': 1.8}))
                    
                    await manager.broadcast({
                        "type": "trading_state_update",
                        "data": result["observation"].dict(exclude_none=True)
                    })
                    state_data = result["trader_state"].dict(exclude_none=True)
                    state_data["has_data"] = behavioral_engine.has_data
                    await manager.broadcast({
                        "type": "behavioral_state_update",
                        "data": state_data
                    })
                    
                    if result.get("behavioral_events"):
                        for evt in result["behavioral_events"]:
                            await manager.broadcast({
                                "type": "event_logged",
                                "data": evt.dict(exclude_none=True)
                            })

                    if result["jarvis_message"]:
                        await manager.broadcast({
                            "type": "jarvis_message",
                            "data": result["jarvis_message"].dict(exclude_none=True)
                        })

                elif msg_type == 'user_message':
                    text = message.get("data", {}).get("text", "")
                    
                    # Send thinking state
                    await manager.broadcast({"type": "jarvis_thinking"})
                    
                    # Process message
                    jarvis_msg = await jarvis_engine.handle_user_message(
                        text, 
                        behavioral_engine.get_state(),
                        {"session_active": True},
                        conversation_history
                    )
                    
                    if jarvis_msg:
                        conversation_history.append({"role": "user", "content": text})
                        conversation_history.append({"role": "model", "content": jarvis_msg.message})
                        
                        await manager.broadcast({
                            "type": "jarvis_message",
                            "data": jarvis_msg.dict(exclude_none=True)
                        })

                elif msg_type == 'screen_frame':
                    image_base64 = message.get("data", {}).get("image", "")
                    if image_base64:
                        if image_base64.startswith("data:image"):
                            image_base64 = image_base64.split(",")[1] if "," in image_base64 else image_base64
                            
                        await manager.broadcast({"type": "observation_state", "data": {"status": "analyzing"}})
                        
                        analysis = await screen_analyzer.analyze_screen(image_base64)
                        
                        await manager.broadcast({
                            "type": "screen_analysis_result",
                            "data": analysis
                        })
                        
                        await manager.broadcast({"type": "observation_state", "data": {"status": "observing"}})
                        
                elif msg_type == 'reset_session':
                    session = await reset_session()
                    await manager.broadcast({
                        "type": "session_update",
                        "data": session.dict(exclude_none=True)
                    })
                    
            except json.JSONDecodeError:
                pass
            except Exception as e:
                print(f"Websocket error handling message: {e}")
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
