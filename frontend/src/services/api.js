const BASE_URL = 'http://localhost:8000';

export const apiService = {
  async getHealth() {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      return await response.json();
    } catch (e) {
      console.error('Health check failed', e);
      return { status: 'error' };
    }
  },

  async getSession() {
    try {
      const response = await fetch(`${BASE_URL}/session`);
      return await response.json();
    } catch (e) {
      console.error('Get session failed', e);
      return null;
    }
  },

  async simulateEvent(eventType, params = {}) {
    try {
      const response = await fetch(`${BASE_URL}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: eventType, ...params })
      });
      return await response.json();
    } catch (e) {
      console.error('Simulate event failed', e);
      return null;
    }
  },

  async resetSession() {
    try {
      const response = await fetch(`${BASE_URL}/session/reset`, {
        method: 'POST'
      });
      return await response.json();
    } catch (e) {
      console.error('Reset session failed', e);
      return null;
    }
  }
};
