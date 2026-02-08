import { useState } from 'react';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import '../styles/Chatbot.css';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const Chatbot = ({ isOpen, onClose }: ChatbotProps) => {
  const [message, setMessage] = useState('');
  const maxLength = 1000;

  const handleSend = () => {
    if (message.trim()) {
      // Handle sending message (functionality to be added later)
      console.log('Message sent:', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-profile">
          <img src="/img/Chatbot-Logo.png" alt="Velocity Bot" className="chatbot-avatar" />
          <div className="chatbot-info">
            <h3>Chat with Velocity</h3>
            <span className="status-indicator">
              <span className="status-dot"></span>
              Online
            </span>
          </div>
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close chat">
          <FaTimes />
        </button>
      </div>

      <div className="chatbot-messages">
        <div className="message bot-message">
          <img src="/img/Chatbot-Logo.png" alt="Bot" className="message-avatar" />
          <div className="message-content">
            <div className="message-header">Velocity Bot</div>
            <div className="message-text">
              Hi there! 👋 Thanks for visiting Velocity. Feel free to ask me anything
              about our rental services, pricing, or availability. Let me know how I can help!
            </div>
          </div>
        </div>
      </div>

      <div className="chatbot-input-area">
        <div className="input-wrapper">
          <textarea
            className="chatbot-input"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
            onKeyPress={handleKeyPress}
            rows={1}
          />
          <button 
            className="send-btn" 
            onClick={handleSend}
            disabled={!message.trim()}
            aria-label="Send message"
          >
            <FaPaperPlane />
          </button>
        </div>
        <div className="input-footer">
          <span className="suggestion-text">Ask me about rentals, pricing, or availability!</span>
          <span className="char-count">{message.length}/{maxLength}</span>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
