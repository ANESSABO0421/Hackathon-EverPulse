import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { chatAPI } from '../../../services/api';
import socketService from '../../../services/socketService';
import './PatientChat.css';

const PatientChat = () => {
  const location = useLocation();
  // State management
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    initializeChat();
    return () => {
      // Cleanup socket connection
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
        socketRef.current = socketService.connect(token);
        setupSocketListeners();
      }

      // Load chats and doctors
      const [chatsResponse, doctorsResponse] = await Promise.all([
        chatAPI.getChats(),
        chatAPI.getAvailableDoctors()
      ]);

      const chatList = chatsResponse.chats || [];
      setChats(chatList);
      setDoctors(doctorsResponse.doctors || []);
      
      // If chatId provided in URL, select that chat
      const params = new URLSearchParams(location.search);
      const initialChatId = params.get('chatId');
      if (initialChatId) {
        const found = chatList.find(c => c._id === initialChatId);
        if (found) {
          setSelectedChat(found);
        } else if (chatList.length > 0) {
          setSelectedChat(chatList[0]);
        }
      } else if (chatList.length > 0) {
        setSelectedChat(chatList[0]);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    // New message received
    socketService.on('newMessage', (message) => {
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.find(m => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
      scrollToBottom();
    });

    // Typing indicator
    socketService.on('typing', (data) => {
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

    // Message read status
    socketService.on('messageReadBy', (data) => {
      setMessages(prev => prev.map(msg => {
        if (msg._id === data.messageId) {
          return {
            ...msg,
            readBy: [...(msg.readBy || []), data.readBy]
          };
        }
        return msg;
      }));
    });

    // Connection status
    socketService.on('connection', (status) => {
      if (!status.connected) {
        toast.error('Connection lost. Attempting to reconnect...');
      } else {
        toast.success('Connected to chat server');
      }
    });
  };

  const loadChatMessages = async () => {
    if (!selectedChat) return;

    try {
      const response = await chatAPI.getChatMessages(selectedChat._id);
      setMessages(response.messages || []);
      
      // Mark messages as read
      await chatAPI.markMessagesAsRead(selectedChat._id);
      
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const joinChatRoom = () => {
    if (selectedChat && socketRef.current) {
      socketService.joinChat(selectedChat._id);
    }
  };

  const leaveChatRoom = () => {
    if (selectedChat && socketRef.current) {
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
      await chatAPI.sendMessage(selectedChat._id, {
        content: messageContent,
        messageType: 'text'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageContent); // Restore message
    } finally {
      setSendingMessage(false);
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      socketService.sendTyping(selectedChat._id, true);
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
    if (!selectedDoctor) return;

    try {
      const response = await chatAPI.getOrCreateChat(selectedDoctor);
      const newChat = response.chat;
      
      // Add to chats list if not already present
      setChats(prev => {
        const exists = prev.find(chat => chat._id === newChat._id);
        if (exists) return prev;
        return [newChat, ...prev];
      });
      
      setSelectedChat(newChat);
      setShowNewChatModal(false);
      setSelectedDoctor('');
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
    } else if (diffInHours < 168) { // 7 days
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

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="patient-chat-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-chat-container">
      <div className="chat-header">
        <h1>Chat with Doctors</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowNewChatModal(true)}
        >
          New Chat
        </button>
      </div>

      <div className="chat-layout">
        {/* Chat List Sidebar */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search chats..."
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
                <h3>No Chats Yet</h3>
                <p>Start a conversation with a doctor</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const otherParticipant = getOtherParticipant(chat);
                const isSelected = selectedChat?._id === chat._id;
                
                return (
                  <div
                    key={chat._id}
                    className={`chat-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="chat-avatar">
                      {otherParticipant?.name?.charAt(0).toUpperCase() || 'D'}
                    </div>
                    <div className="chat-info">
                      <div className="chat-name">{otherParticipant?.name || 'Unknown'}</div>
                      <div className="chat-specialization">{otherParticipant?.specialization || ''}</div>
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
                  <div className="user-avatar">
                    {getOtherParticipant(selectedChat)?.name?.charAt(0).toUpperCase() || 'D'}
                  </div>
                  <div className="user-details">
                    <h3>{getOtherParticipant(selectedChat)?.name || 'Unknown Doctor'}</h3>
                    <p>{getOtherParticipant(selectedChat)?.specialization || 'General Medicine'}</p>
                  </div>
                </div>
                <div className="chat-status">
                  <span className="status-indicator online"></span>
                  <span>Online</span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="messages-container">
                <div className="messages-list">
                  {messages.map((message) => {
                    const isOwnMessage = message.senderId === localStorage.getItem('userId');
                    const messageTime = formatTime(message.createdAt);
                    
                    return (
                      <div
                        key={message._id}
                        className={`message ${isOwnMessage ? 'own' : 'other'}`}
                      >
                        <div className="message-content">
                          <div className="message-text">{message.content}</div>
                          <div className="message-time">{messageTime}</div>
                          {isOwnMessage && (
                            <div className="message-status">
                              {message.readBy && message.readBy.length > 1 ? '✓✓' : '✓'}
                            </div>
                          )}
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
              <h3>Select a chat to start messaging</h3>
              <p>Choose a conversation from the sidebar or start a new one</p>
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
              <div className="doctor-search">
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="doctors-list">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className={`doctor-item ${selectedDoctor === doctor._id ? 'selected' : ''}`}
                    onClick={() => setSelectedDoctor(doctor._id)}
                  >
                    <div className="doctor-avatar">
                      {doctor.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="doctor-info">
                      <h4>{doctor.name}</h4>
                      <p>{doctor.specialization}</p>
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
                disabled={!selectedDoctor}
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

export default PatientChat;