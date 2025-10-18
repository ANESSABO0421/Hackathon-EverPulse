import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    try {
      const SERVER_URL = (import.meta?.env?.VITE_SOCKET_SERVER_URL) || (import.meta?.env?.VITE_SERVER_URL) || 'http://localhost:3000';
      console.log('Connecting to socket server:', SERVER_URL);
      
      this.socket = io(SERVER_URL, {
        path: '/socket.io',
        auth: { token },
        transports: ['websocket', 'polling'],
        withCredentials: true,
        timeout: 20000,
        forceNew: true
      });

      this.setupEventListeners();
      return this.socket;
    } catch (error) {
      console.error('Failed to connect to socket server:', error);
      throw error;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.isConnected = true;
      this.emit('connection', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from chat server:', reason);
      this.isConnected = false;
      this.emit('connection', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.emit('error', error);
    });

    // Chat events
    this.socket.on('newMessage', (message) => {
      this.emit('newMessage', message);
    });

    this.socket.on('messageRead', (data) => {
      this.emit('messageRead', data);
    });

    this.socket.on('messageReadBy', (data) => {
      this.emit('messageReadBy', data);
    });

    this.socket.on('typing', (data) => {
      this.emit('typing', data);
    });

    this.socket.on('userJoined', (data) => {
      this.emit('userJoined', data);
    });

    this.socket.on('userLeft', (data) => {
      this.emit('userLeft', data);
    });

    this.socket.on('userStatusChanged', (data) => {
      this.emit('userStatusChanged', data);
    });

    this.socket.on('messageDelivered', (data) => {
      this.emit('messageDelivered', data);
    });
  }

  // Join a chat room
  joinChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinChat', chatId);
    }
  }

  // Leave a chat room
  leaveChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveChat', chatId);
    }
  }

  // Send typing indicator
  sendTyping(chatId, isTyping) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { chatId, isTyping });
    }
  }

  // Send typing indicator with user info
  sendTypingWithUser(chatId, isTyping, userId, userName) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { 
        chatId, 
        isTyping, 
        userId, 
        userName 
      });
    }
  }

  // Mark message as delivered
  markMessageDelivered(messageId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('messageDelivered', messageId);
    }
  }

  // Mark message as read
  markMessageRead(messageId, chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('messageRead', { messageId, chatId });
    }
  }

  // Set online status
  setOnlineStatus(status) {
    if (this.socket && this.isConnected) {
      this.socket.emit('setOnlineStatus', status);
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null
    };
  }

  // Reconnect if disconnected
  reconnect(token) {
    if (!this.isConnected) {
      this.connect(token);
    }
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
