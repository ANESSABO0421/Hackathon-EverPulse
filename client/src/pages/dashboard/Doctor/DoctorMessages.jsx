import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { chatAPI } from '../../../services/api';
import socketService from '../../../services/socketService';
import './DoctorMessages.css';

const DoctorMessages = () => {
  const location = useLocation();
  
  // State management
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    initializeChat();
    return () => {
      if (socketRef.current) {
        socketService.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadChatMessages();
      joinChatRoom();
    }
    return () => {
      if (selectedChat) {
        leaveChatRoom();
      }
    };
  }, [selectedChat]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      
      // Connect to socket
      const token = localStorage.getItem('token');
      if (token) {
        try {
          socketRef.current = socketService.connect(token);
          setupSocketListeners();
          console.log('Doctor socket connected successfully');
        } catch (socketError) {
          console.error('Socket connection failed:', socketError);
          toast.warning('Real-time features may not work properly');
        }
      } else {
        console.warn('No authentication token found');
        toast.error('Please log in again');
        return;
      }

      // Load chats and patients
      console.log('Loading doctor chats and patients...');
      const [chatsResponse, patientsResponse] = await Promise.all([
        chatAPI.getChats(),
        getDoctorPatients()
      ]);

      console.log('Doctor chats response:', chatsResponse);
      console.log('Patients response:', patientsResponse);

      const chatList = chatsResponse.chats || [];
      setChats(chatList);
      setPatients(patientsResponse.patients || []);
      
      // Select first chat if available
      if (chatList.length > 0) {
        setSelectedChat(chatList[0]);
      }
    } catch (error) {
      console.error('Error initializing doctor chat:', error);
      toast.error(`Failed to load chats: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getDoctorPatients = async () => {
    try {
      const response = await chatAPI.getDoctorPatients();
      return response;
    } catch (error) {
      console.error('Error loading patients:', error);
      return { patients: [] };
    }
  };

  const setupSocketListeners = () => {
    // New message received
    socketService.on('newMessage', (message) => {
      console.log('Doctor received new message:', message);
      setMessages(prev => {
        const exists = prev.find(m => m._id === message._id);
        if (exists) {
          return prev.map(m => m._id === message._id ? message : m);
        }
        return [...prev, message];
      });
      scrollToBottom();
    });

    // Typing indicator
    socketService.on('typing', (data) => {
      console.log('Typing indicator received:', data);
      if (data.userId !== localStorage.getItem('userId')) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            return [...prev.filter(u => u.userId !== data.userId), data];
          } else {
            return prev.filter(u => u.userId !== data.userId);
          }
        });
      }
    });

    // User status changes
    socketService.on('userStatusChanged', (data) => {
      console.log('User status changed:', data);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.status === 'online') {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    // User joined/left chat
    socketService.on('userJoined', (data) => {
      console.log('User joined chat:', data);
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    });

    socketService.on('userLeft', (data) => {
      console.log('User left chat:', data);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    // Message read status
    socketService.on('messageReadBy', (data) => {
      console.log('Message read by:', data);
      setMessages(prev => prev.map(msg => {
        if (msg._id === data.messageId) {
          return {
            ...msg,
            readBy: [...(msg.readBy || []), data.readBy],
            status: 'read'
          };
        }
        return msg;
      }));
    });

    // Message delivered status
    socketService.on('messageDelivered', (data) => {
      console.log('Message delivered:', data);
      setMessages(prev => prev.map(msg => {
        if (msg._id === data.messageId) {
          return {
            ...msg,
            status: 'delivered'
          };
        }
        return msg;
      }));
    });

    // Connection status
    socketService.on('connection', (status) => {
      console.log('Doctor socket connection status:', status);
      if (!status.connected) {
        toast.error('Connection lost. Attempting to reconnect...');
      } else {
        toast.success('Connected to chat server');
      }
    });

    // Error handling
    socketService.on('error', (error) => {
      console.error('Doctor socket error:', error);
      toast.error('Connection error occurred');
    });
  };

  const loadChatMessages = async () => {
    if (!selectedChat) return;

    try {
      console.log('Loading messages for chat:', selectedChat._id);
      const response = await chatAPI.getChatMessages(selectedChat._id);
      console.log('Messages response:', response);
      
      setMessages(response.messages || []);
      
      // Mark messages as read
      try {
        await chatAPI.markMessagesAsRead(selectedChat._id);
        console.log('Messages marked as read');
      } catch (readError) {
        console.warn('Failed to mark messages as read:', readError);
      }
      
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error(`Failed to load messages: ${error.message}`);
    }
  };

  const joinChatRoom = () => {
    if (selectedChat && socketRef.current) {
      console.log('Doctor joining chat room:', selectedChat._id);
      socketService.joinChat(selectedChat._id);
    }
  };

  const leaveChatRoom = () => {
    if (selectedChat && socketRef.current) {
      console.log('Doctor leaving chat room:', selectedChat._id);
      socketService.leaveChat(selectedChat._id);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChat || sendingMessage) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    // Clear typing indicator
    if (isTyping) {
      socketService.sendTyping(selectedChat._id, false);
      setIsTyping(false);
    }

    try {
      console.log('Doctor sending message:', { chatId: selectedChat._id, content: messageContent });
      const response = await chatAPI.sendMessage(selectedChat._id, {
        content: messageContent,
        messageType: 'text'
      });
      console.log('Message sent successfully:', response);
      
      // Add message to local state immediately for better UX
      const newMsg = {
        _id: Date.now().toString(),
        content: messageContent,
        senderId: localStorage.getItem('userId'),
        senderType: 'doctor',
        senderName: localStorage.getItem('userName') || 'Dr. You',
        createdAt: new Date().toISOString(),
        status: 'sending'
      };
      
      setMessages(prev => [...prev, newMsg]);
      scrollToBottom();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error.message}`);
      setNewMessage(messageContent);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      socketService.sendTypingWithUser(
        selectedChat._id, 
        true, 
        localStorage.getItem('userId'),
        localStorage.getItem('userName') || 'Doctor'
      );
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      socketService.sendTyping(selectedChat._id, false);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socketService.sendTyping(selectedChat._id, false);
      }
    }, 1000);
  };

  const handleCreateNewChat = async () => {
    if (!selectedPatient) return;

    try {
      const response = await chatAPI.getOrCreateChat(selectedPatient);
      const newChat = response.chat;
      
      setChats(prev => {
        const exists = prev.find(chat => chat._id === newChat._id);
        if (exists) return prev;
        return [newChat, ...prev];
      });
      
      setSelectedChat(newChat);
      setShowNewChatModal(false);
      setSelectedPatient('');
      toast.success('Chat created successfully');
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getOtherParticipant = (chat) => {
    const currentUserId = localStorage.getItem('userId');
    return chat.participants.find(p => p.userId !== currentUserId);
  };

  const filteredChats = chats.filter(chat => {
    const otherParticipant = getOtherParticipant(chat);
    return otherParticipant?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
  return (
      <div className="doctor-messages-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-messages-container">
      <div className="chat-header">
        <h1>Patient Messages</h1>
        <div className="header-actions">
          <span className="online-indicator">
            <span className="status-dot online"></span>
            {onlineUsers.size} online
          </span>
          <button 
            className="btn btn-primary"
            onClick={() => setShowNewChatModal(true)}
          >
            New Chat
          </button>
        </div>
      </div>

      <div className="chat-layout">
        {/* Chat List Sidebar */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          <div className="chat-list">
            {filteredChats.length === 0 ? (
              <div className="no-chats">
                <div className="no-chats-icon">💬</div>
                <h3>No Conversations</h3>
                <p>Start chatting with your patients</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const otherParticipant = getOtherParticipant(chat);
                const isSelected = selectedChat?._id === chat._id;
                const isOnline = onlineUsers.has(otherParticipant?.userId);
                
                return (
                  <div
                    key={chat._id}
                    className={`chat-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="chat-avatar-container">
                      <div className="chat-avatar">
                        {otherParticipant?.name?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      {isOnline && <div className="online-indicator-small"></div>}
                    </div>
                    <div className="chat-info">
                      <div className="chat-name">
                        {otherParticipant?.name || 'Unknown Patient'}
                        {isOnline && <span className="online-text">• Online</span>}
                      </div>
                      <div className="chat-last-message">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </div>
                    </div>
                    <div className="chat-meta">
                      <div className="chat-time">
                        {chat.lastMessage?.timestamp ? formatTime(chat.lastMessage.timestamp) : ''}
                      </div>
                      {chat.unreadCount > 0 && (
                        <div className="unread-badge">{chat.unreadCount}</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="chat-main">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="chat-main-header">
                <div className="chat-user-info">
                  <div className="user-avatar-container">
                    <div className="user-avatar">
                      {getOtherParticipant(selectedChat)?.name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    {onlineUsers.has(getOtherParticipant(selectedChat)?.userId) && (
                      <div className="online-indicator-small"></div>
                    )}
                  </div>
                  <div className="user-details">
                    <h3>{getOtherParticipant(selectedChat)?.name || 'Unknown Patient'}</h3>
                    <p>
                      {onlineUsers.has(getOtherParticipant(selectedChat)?.userId) ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="action-btn" title="Call">
                    📞
                  </button>
                  <button className="action-btn" title="Video Call">
                    📹
                  </button>
                  <button className="action-btn" title="More">
                    ⋮
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="messages-container">
                <div className="messages-list">
                  {messages.map((message, index) => {
                    const isOwnMessage = message.senderId === localStorage.getItem('userId');
                    const messageTime = formatTime(message.createdAt);
                    const prevMessage = messages[index - 1];
                    const showDate = !prevMessage || 
                      new Date(message.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();
                    
                    return (
                      <div key={message._id}>
                        {showDate && (
                          <div className="message-date-divider">
                            <span>{new Date(message.createdAt).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                        )}
                        <div className={`message ${isOwnMessage ? 'own' : 'other'}`}>
                          <div className="message-content">
                            <div className="message-text">{message.content}</div>
                            <div className="message-meta">
                              <div className="message-time">{messageTime}</div>
                              {isOwnMessage && (
                                <div className="message-status">
                                  {message.status === 'read' || (message.readBy && message.readBy.length > 1) ? (
                                    <span className="read-status">✓✓</span>
                                  ) : message.status === 'delivered' ? (
                                    <span className="delivered-status">✓✓</span>
                                  ) : (
                                    <span className="sent-status">✓</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Typing Indicator */}
                  {typingUsers.length > 0 && (
                    <div className="typing-indicator">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className="typing-text">
                        {typingUsers[0].userName} is typing...
                      </span>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="message-input-container">
                <form onSubmit={handleSendMessage} className="message-form">
                  <div className="input-actions">
                    <button type="button" className="attachment-btn" title="Attach file">
                      📎
                    </button>
                    <button type="button" className="emoji-btn" title="Emoji">
                      😊
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={handleTyping}
                    className="message-input"
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    className="send-button"
                    disabled={!newMessage.trim() || sendingMessage}
                  >
                    {sendingMessage ? '⏳' : '📤'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a patient conversation from the sidebar</p>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Start New Chat</h2>
              <button
                className="close-button"
                onClick={() => setShowNewChatModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="patient-search">
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="patients-list">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    className={`patient-item ${selectedPatient === patient._id ? 'selected' : ''}`}
                    onClick={() => setSelectedPatient(patient._id)}
                  >
                    <div className="patient-avatar">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="patient-info">
                      <h4>{patient.name}</h4>
                      <p>{patient.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowNewChatModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateNewChat}
                disabled={!selectedPatient}
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorMessages;