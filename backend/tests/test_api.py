import pytest
from httpx import AsyncClient
from main import app
import time

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": "0.1.0"}

@pytest.mark.asyncio
async def test_session_reset():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/session/reset")
    assert response.status_code == 200
    data = response.json()
    assert data["trader_state"]["state"] == "stable"
    assert len(data["trades"]) == 0

@pytest.mark.asyncio
async def test_simulate_trade_opened():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        await ac.post("/api/session/reset")
        response = await ac.post("/api/simulate/event", json={"event_type": "trade_opened", "params": {}})
    
    assert response.status_code == 200
    data = response.json()
    assert data["trade"]["result"] == "open"
    assert data["jarvis_message"]["message_type"] == "informational"

@pytest.mark.asyncio
async def test_simulate_loss():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        await ac.post("/api/session/reset")
        await ac.post("/api/simulate/event", json={"event_type": "trade_opened", "params": {}})
        response = await ac.post("/api/simulate/event", json={"event_type": "trade_closed_loss", "params": {}})
    
    assert response.status_code == 200
    data = response.json()
    assert data["trade"]["result"] == "loss"
    assert data["jarvis_message"]["message_type"] == "post_trade"

@pytest.mark.asyncio
async def test_rapid_reentry_detection():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        await ac.post("/api/session/reset")
        await ac.post("/api/simulate/event", json={"event_type": "trade_opened", "params": {}})
        await ac.post("/api/simulate/event", json={"event_type": "trade_closed_loss", "params": {}})
        response = await ac.post("/api/simulate/event", json={"event_type": "rapid_reentry", "params": {}})
        
    assert response.status_code == 200
    data = response.json()
    events = data["behavioral_events"]
    assert any(e["event_type"] == "rapid_reentry" for e in events)

@pytest.mark.asyncio
async def test_revenge_risk_detection():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        await ac.post("/api/session/reset")
        # 1st trade
        await ac.post("/api/simulate/event", json={"event_type": "trade_opened", "params": {"position_size": 1.0}})
        # Loss
        await ac.post("/api/simulate/event", json={"event_type": "trade_closed_loss", "params": {}})
        # Rapid Reentry with position size increase
        response = await ac.post("/api/simulate/event", json={"event_type": "rapid_reentry", "params": {"position_size": 2.0}})
        
    assert response.status_code == 200
    data = response.json()
    
    events = data["behavioral_events"]
    assert any(e["event_type"] == "revenge_trading" for e in events)
    assert data["trader_state"]["state"] == "revenge_risk"
    
    assert data["jarvis_message"]["severity"] == "critical"
    assert data["jarvis_message"]["message_type"] == "intervention"

@pytest.mark.asyncio
async def test_consecutive_losses():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        await ac.post("/api/session/reset")
        await ac.post("/api/simulate/event", json={"event_type": "trade_opened", "params": {}})
        await ac.post("/api/simulate/event", json={"event_type": "trade_closed_loss", "params": {}})
        time.sleep(0.1) # not rapid
        await ac.post("/api/simulate/event", json={"event_type": "trade_opened", "params": {}})
        response = await ac.post("/api/simulate/event", json={"event_type": "trade_closed_loss", "params": {}})
        
    assert response.status_code == 200
    data = response.json()
    events = data["behavioral_events"]
    assert any(e["event_type"] == "consecutive_loss" for e in events)
    assert data["jarvis_message"]["message_type"] == "behavioral"

@pytest.mark.asyncio
async def test_state_transitions():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        await ac.post("/api/session/reset")
        # Stable -> Elevated (Position Size Increased)
        await ac.post("/api/simulate/event", json={"event_type": "trade_opened", "params": {"position_size": 1.0}})
        response = await ac.post("/api/simulate/event", json={"event_type": "position_size_increased", "params": {}})
        data = response.json()
        assert data["trader_state"]["state"] == "elevated"
