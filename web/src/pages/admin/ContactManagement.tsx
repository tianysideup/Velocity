import { useState, useEffect } from 'react';
import { subscribeToContactMessages, deleteContactMessage, type ContactMessage } from '../../services/contactService';
import { adminDb } from '../../config/firebase';
import { FaEnvelope, FaPhone, FaTrash } from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/admin/ContactManagement.css';

const ContactManagement = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    console.log('Setting up real-time contact messages listener');
    setLoading(true);
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToContactMessages((data) => {
      console.log('Received contact messages update:', data.length, 'messages');
      setMessages(data);
      setLoading(false);
    }, adminDb);

    // Cleanup listener on unmount
    return () => {
      console.log('Cleaning up contact messages listener');
      unsubscribe();
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!id) return;

    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      setProcessing(id);
      await deleteContactMessage(id, adminDb);
      // No need to reload - real-time listener will update automatically
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <AdminLayout>
      <div className="contact-management">
        <div className="management-header">
          <h1>Contact Messages</h1>
        
        </div>

        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-data">
            <p>No messages found</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div key={message.id} className="message-item">
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
                </div>

                <div className="message-content">
                  <h4>Message:</h4>
                  <p>{message.message}</p>
                </div>

                <div className="message-footer">
                  <div className="message-date">
                    <small>Received: {new Date(message.createdAt).toLocaleDateString()} {new Date(message.createdAt).toLocaleTimeString()}</small>
                  </div>

                  <div className="message-actions">
                    <button
                      onClick={() => handleDelete(message.id!)}
                      className="delete-btn"
                      disabled={processing === message.id}
                    >
                      <FaTrash />
                      {processing === message.id ? 'Deleting...' : 'Delete'}
                    </button>
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
