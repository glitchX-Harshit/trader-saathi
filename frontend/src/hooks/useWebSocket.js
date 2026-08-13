import { useState, useEffect, useCallback } from 'react';
import { wsService } from '../services/websocket';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [traderState, setTraderState] = useState(null);
  const [jarvisMessages, setJarvisMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [observation, setObservation] = useState(null);
  const [sessionPnl, setSessionPnl] = useState(0);
  const [jarvisThinking, setJarvisThinking] = useState(false);
  const [observationStatus, setObservationStatus] = useState('disconnected');

  useEffect(() => {
    const handleConnected = (status) => setConnected(status);
    
    const handleMessage = (msg) => {
      const { type, data } = msg;
      
      switch (type) {
        case 'session_update':
          if (data.trader_state) setTraderState(data.trader_state);
          if (data.current_observation) setObservation(data.current_observation);
          if (data.jarvis_messages) setJarvisMessages(data.jarvis_messages);
          if (data.events) setEvents(data.events.map(e => ({
            timestamp: e.timestamp,
            type: e.event_type,
            title: e.detected_pattern,
            severity: e.severity === 'critical' ? 'danger' : e.severity === 'high' ? 'warning' : 'info',
            description: `${e.detected_pattern} detected (confidence: ${(e.confidence * 100).toFixed(0)}%)`
          })));
          setSessionPnl(data.trader_state?.session_pnl || 0);
          break;
          
        case 'trading_state_update':
          setObservation(data);
          break;
          
        case 'behavioral_state_update':
          setTraderState(data);
          setSessionPnl(data.session_pnl || 0);
          break;
          
        case 'jarvis_message':
          setJarvisMessages(prev => [data, ...prev].slice(0, 50));
          setJarvisThinking(false);
          break;
          
        case 'jarvis_thinking':
          setJarvisThinking(true);
          break;
          
        case 'event_logged':
          setEvents(prev => [{
            timestamp: data.timestamp,
            type: data.event_type,
            title: data.detected_pattern,
            severity: data.severity === 'critical' ? 'danger' : data.severity === 'high' ? 'warning' : 'info',
            description: `${data.detected_pattern} detected (confidence: ${(data.confidence * 100).toFixed(0)}%)`,
            jarvisResponse: data.jarvis_response || null
          }, ...prev].slice(0, 100));
          break;
          
        case 'observation_state':
          setObservationStatus(data.status);
          break;
      }
    };

    wsService.on('connected', handleConnected);
    wsService.on('message', handleMessage);
    wsService.connect();

    return () => {
      wsService.off('connected', handleConnected);
      wsService.off('message', handleMessage);
    };
  }, []);

  const send = useCallback((type, data) => {
    wsService.send(type, data);
  }, []);

  return { connected, traderState, jarvisMessages, events, observation, sessionPnl, jarvisThinking, observationStatus, send };
}
