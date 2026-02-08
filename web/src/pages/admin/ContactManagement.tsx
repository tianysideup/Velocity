import { useState, useEffect } from 'react';
import { getAllContactMessages, replyToMessage, deleteContactMessage, type ContactMessage } from '../../services/contactService';
import { FaEnvelope, FaPhone, FaTrash, FaReply, FaClock, FaCheckCircle } from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/admin/ContactManagement.css';

const ContactManagement = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'replied'>('all');
  const [processing, setProcessing] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadMessages();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadMessages();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getAllContactMessages();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id: string) => {
    if (!id || !replyText.trim()) return;

    try {
      setProcessing(id);
      await replyToMessage(id, replyText);
      await loadMessages();
      setReplyingTo(null);
      setReplyText('');
    } catch (error) {
      console.error('Error replying to message:', error);
      alert('Failed to send reply');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;

    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      setProcessing(id);
      await deleteContactMessage(id);
      await loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    } finally {
      setProcessing(null);
    }
  };

  const filteredMessages = messages.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const stats = {
    total: messages.length,
    pending: messages.filter(m => m.status === 'pending').length,
    replied: messages.filter(m => m.status === 'replied').length,
  };

  return (
    <AdminLayout>
      <div className="contact-management">
        <div className="management-header">
          <h1>Contact Messages</h1>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <FaEnvelope />
            </div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total Messages</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <FaClock />
            </div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon replied">
              <FaCheckCircle />
            </div>
            <div className="stat-info">
              <h3>{stats.replied}</h3>
              <p>Replied</p>
            </div>
          </div>
        </div>

        <div className="filter-bar">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({stats.pending})
          </button>
          <button 
            className={`filter-btn ${filter === 'replied' ? 'active' : ''}`}
            onClick={() => setFilter('replied')}
          >
            Replied ({stats.replied})
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="no-data">
            <p>No messages found</p>
          </div>
        ) : (
          <div className="messages-list">
            {filteredMessages.map((message) => (
              <div key={message.id} className={`message-item ${message.status}`}>
                <div className="message-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {message.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{message.name}</h3>
                      <div className="contact-details">
                        <span><FaEnvelope /> {message.email}</span>
                        {message.phone && <span><FaPhone /> {message.phone}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="message-meta">
                    <span className={`status-badge ${message.status}`}>
                      {message.status}
                    </span>
                  </div>
                </div>

                <div className="message-content">
                  <h4>Message:</h4>
                  <p>{message.message}</p>
                </div>

                {message.reply && (
                  <div className="reply-section">
                    <h4>Your Reply:</h4>
                    <p>{message.reply}</p>
                  </div>
                )}

                <div className="message-footer">
                  <div className="message-date">
                    <small>Received: {new Date(message.createdAt).toLocaleDateString()} {new Date(message.createdAt).toLocaleTimeString()}</small>
                    {message.repliedAt && (
                      <small>Replied: {new Date(message.repliedAt).toLocaleDateString()}</small>
                    )}
                  </div>

                  <div className="message-actions">
                    {replyingTo === message.id ? (
                      <div className="reply-form">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply..."
                          rows={3}
                          autoFocus
                        />
                        <div className="reply-actions">
                          <button
                            onClick={() => handleReply(message.id!)}
                            className="send-btn"
                            disabled={processing === message.id || !replyText.trim()}
                          >
                            <FaCheckCircle />
                            {processing === message.id ? 'Sending...' : 'Send Reply'}
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="cancel-btn"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setReplyingTo(message.id!);
                            setReplyText(message.reply || '');
                          }}
                          className="reply-btn"
                        >
                          <FaReply />
                          {message.status === 'replied' ? 'Edit Reply' : 'Reply'}
                        </button>
                        <button
                          onClick={() => handleDelete(message.id!)}
                          className="delete-btn"
                          disabled={processing === message.id}
                        >
                          <FaTrash />
                          {processing === message.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ContactManagement;
