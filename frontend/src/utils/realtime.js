// Real-time update utilities
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';

class RealtimeManager {
  constructor() {
    this.subscribers = new Map();
    this.lastUpdate = new Map();
  }

  // Subscribe to real-time updates for a specific data type
  subscribe(dataType, callback, interval = 30000) { // Default 30 seconds
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, new Set());
    }
    
    this.subscribers.get(dataType).add(callback);
    
    // Start polling if this is the first subscriber
    if (this.subscribers.get(dataType).size === 1) {
      this.startPolling(dataType, interval);
    }
    
    // Return unsubscribe function
    return () => {
      this.unsubscribe(dataType, callback);
    };
  }

  // Unsubscribe from updates
  unsubscribe(dataType, callback) {
    if (this.subscribers.has(dataType)) {
      this.subscribers.get(dataType).delete(callback);
      
      // Stop polling if no more subscribers
      if (this.subscribers.get(dataType).size === 0) {
        this.stopPolling(dataType);
      }
    }
  }

  // Start polling for updates
  startPolling(dataType, interval) {
    const pollId = setInterval(async () => {
      try {
        await this.checkForUpdates(dataType);
      } catch (error) {
        console.error(`Polling error for ${dataType}:`, error);
      }
    }, interval);
    
    this.lastUpdate.set(`${dataType}_pollId`, pollId);
  }

  // Stop polling
  stopPolling(dataType) {
    const pollId = this.lastUpdate.get(`${dataType}_pollId`);
    if (pollId) {
      clearInterval(pollId);
      this.lastUpdate.delete(`${dataType}_pollId`);
    }
  }

  // Check for updates
  async checkForUpdates(dataType) {
    const lastCheck = this.lastUpdate.get(dataType) || 0;
    const now = Date.now();
    
    try {
      let endpoint = '';
      let headers = {};
      
      // Determine endpoint based on data type
      switch (dataType) {
        case 'products':
          endpoint = `${API_BASE_URL}/api/products`;
          const adminToken = localStorage.getItem("AToken");
          if (adminToken) {
            headers['Authorization'] = `Bearer ${adminToken}`;
          }
          break;
        case 'orders':
          endpoint = `${API_BASE_URL}/api/orders/admin/all`;
          const token = localStorage.getItem("AToken");
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          break;
        case 'users':
          endpoint = `${API_BASE_URL}/api/users/users`;
          const userToken = localStorage.getItem("AToken");
          if (userToken) {
            headers['Authorization'] = `Bearer ${userToken}`;
          }
          break;
        default:
          return;
      }
      
      // Add cache busting
      const separator = endpoint.includes('?') ? '&' : '?';
      const response = await fetch(`${endpoint}${separator}_t=${now}`, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          ...headers
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Notify all subscribers
        if (this.subscribers.has(dataType)) {
          this.subscribers.get(dataType).forEach(callback => {
            try {
              callback(data, { isUpdate: lastCheck > 0, timestamp: now });
            } catch (error) {
              console.error(`Callback error for ${dataType}:`, error);
            }
          });
        }
        
        this.lastUpdate.set(dataType, now);
      }
    } catch (error) {
      // Don't log rate limiting errors
      if (!error.message || !error.message.includes('429')) {
        console.error(`Update check failed for ${dataType}:`, error);
      }
    }
  }

  // Manual trigger for immediate updates
  async triggerUpdate(dataType) {
    await this.checkForUpdates(dataType);
  }

  // Show notification for data changes
  notifyChange(dataType, message, type = 'success') {
    const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    toast(`${icon} ${message}`, {
      duration: 3000,
      position: 'top-right',
    });
  }

  // Cleanup all subscriptions
  cleanup() {
    this.subscribers.forEach((_, dataType) => {
      this.stopPolling(dataType);
    });
    this.subscribers.clear();
    this.lastUpdate.clear();
  }
}

// Create singleton instance
const realtimeManager = new RealtimeManager();

// Export subscription functions for easy use in components
// Note: These are NOT React hooks, they are subscription functions
export const subscribeToProducts = (callback, interval = 30000) => {
  return realtimeManager.subscribe('products', callback, interval);
};

export const subscribeToOrders = (callback, interval = 30000) => {
  return realtimeManager.subscribe('orders', callback, interval);
};

export const subscribeToUsers = (callback, interval = 60000) => {
  return realtimeManager.subscribe('users', callback, interval);
};

export const triggerProductUpdate = () => {
  return realtimeManager.triggerUpdate('products');
};

export const triggerOrderUpdate = () => {
  return realtimeManager.triggerUpdate('orders');
};

export const notifyDataChange = (dataType, message, type = 'success') => {
  return realtimeManager.notifyChange(dataType, message, type);
};

export default realtimeManager;