import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import '../styles/Chatbot.css';

/**
 * Chatbot Component with AI Integration
 * 
 * ✅ CONFIGURED: Using OpenRouter API (Llama 3.1 8B - Free model)
 * 
 * API Configuration:
 * - API Key: Stored in .env as VITE_OPENROUTER_API_KEY
 * - Endpoint: Stored in .env as VITE_AI_API_ENDPOINT
 * - Model: meta-llama/llama-3.1-8b-instruct:free
 * 
 * To change the AI model or provider:
 * 1. Update the model name in the fetch request body
 * 2. Available free models on OpenRouter:
 *    - meta-llama/llama-3.1-8b-instruct:free
 *    - google/gemma-7b-it:free
 *    - mistralai/mistral-7b-instruct:free
 * 
 * For paid models with better performance:
 *    - openai/gpt-3.5-turbo
 *    - anthropic/claude-3-haiku
 *    - google/gemini-pro
 */

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot = ({ isOpen, onClose }: ChatbotProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! 👋 Thanks for visiting Velocity. Feel free to ask me anything about our rental services, pricing, or availability. Let me know how I can help!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maxLength = 1000;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      const apiEndpoint = import.meta.env.VITE_AI_API_ENDPOINT;

      // Debug logging
      console.log('API Configuration:', {
        hasApiKey: !!apiKey,
        hasEndpoint: !!apiEndpoint,
        endpoint: apiEndpoint
      });

      if (!apiKey || !apiEndpoint) {
        console.error('Missing API configuration. Please restart the dev server after creating .env file.');
        return "⚠️ Configuration Error: Please restart the development server (stop with Ctrl+C and run 'npm run dev' again) to load the API settings.";
      }

      console.log('Sending request to AI...');

      const requestBody = {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for Velocity car rental service. Help users with questions about rentals, pricing, vehicle availability, and booking process. Be friendly, concise, and professional.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ]
      };

      console.log('Request body:', requestBody);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://velocity.com',
          'X-Title': 'Velocity Car Rental'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        console.error('API Error Response:', errorData);
        console.error('Full error details:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorData
        });
        
        if (response.status === 401) {
          return "🔑 API Key Error: The API key may be invalid or expired. Please check your OpenRouter API key.";
        } else if (response.status === 402) {
          return "💳 Payment Required: The API key has insufficient credits. Please add credits to your OpenRouter account.";
        } else if (response.status === 429) {
          return "⏱️ Rate Limit: Too many requests. Please wait a moment and try again.";
        }
        
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI Response received:', data);
      
      const aiMessage = data.choices?.[0]?.message?.content;
      if (!aiMessage) {
        console.error('No message in response:', data);
        return "I received a response but couldn't understand it. Please try rephrasing your question.";
      }
      
      return aiMessage;
    } catch (error: any) {
      console.error('AI API Error Details:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      
      if (error.message?.includes('fetch')) {
        return "🌐 Network Error: Unable to connect to the AI service. Please check your internet connection or try again later.";
      }
      
      return "I'm having trouble connecting right now. Please try again in a moment, or feel free to contact us directly for immediate assistance!";
    }
  };

  const handleSend = async () => {
    if (message.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      setIsLoading(true);

      // Get AI response
      const aiResponseText = await getAIResponse(userMessage.text);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
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
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender === 'bot' ? 'bot-message' : 'user-message'}`}>
            {msg.sender === 'bot' && (
              <img src="/img/Chatbot-Logo.png" alt="Bot" className="message-avatar" />
            )}
            <div className="message-content">
              {msg.sender === 'bot' && <div className="message-header">Velocity Bot</div>}
              <div className="message-text">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot-message">
            <img src="/img/Chatbot-Logo.png" alt="Bot" className="message-avatar" />
            <div className="message-content">
              <div className="message-header">Velocity Bot</div>
              <div className="message-text typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input-area">
        <div className="input-wrapper">
          <textarea
            className="chatbot-input"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            rows={1}
          />
          <button 
            className="send-btn" 
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
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
