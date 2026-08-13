class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
    this.url = 'ws://localhost:8000/ws';
    this.reconnectTimeout = null;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected', true);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('message', data);
        if (data.type) {
          this.emit(data.type, data.data || data);
        }
      } catch (e) {
        console.error('Error parsing WS message:', e);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('connected', false);
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      console.log(`Reconnecting in ${timeout}ms...`);
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = setTimeout(() => this.connect(), timeout);
    }
  }

  disconnect() {
    if (this.ws) {
      clearTimeout(this.reconnectTimeout);
      this.ws.close();
      this.ws = null;
    }
  }

  send(type, data = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn('Cannot send message, WebSocket not connected');
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
}

export const wsService = new WebSocketService();
