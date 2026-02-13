import { useState, useEffect } from 'react';
import { subscribeToTestimonials, updateTestimonialStatus, deleteTestimonial, type Testimonial } from '../../services/testimonialService';
import { adminDb } from '../../config/firebase';
import { FaCheckCircle, FaTrash, FaStar, FaClock } from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/admin/TestimonialManagement.css';

const TestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    console.log('Setting up real-time testimonial listener');
    setLoading(true);
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToTestimonials((data) => {
      console.log('Received testimonial update:', data.length, 'testimonials');
      setTestimonials(data);
      setLoading(false);
    }, adminDb);

    // Cleanup listener on unmount
    return () => {
      console.log('Cleaning up testimonial listener');
      unsubscribe();
    };
  }, []);

  const handleApprove = async (id: string) => {
    console.log('handleApprove called with id:', id);
    
    if (!id) {
      alert('Invalid testimonial ID');
      return;
    }
    
    try {
      setProcessing(id);
      await updateTestimonialStatus(id, 'approved', adminDb);
      // No need to reload - real-time listener will update automatically
      alert('Testimonial approved successfully!');
    } catch (error: any) {
      console.error('Error approving testimonial:', error);
      alert(`Failed to approve testimonial: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    console.log('handleDelete called with id:', id);
    
    if (!id) {
      alert('Invalid testimonial ID');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      setProcessing(id);
      await deleteTestimonial(id, adminDb);
      // No need to reload - real-time listener will update automatically
      alert('Testimonial deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting testimonial:', error);
      alert(`Failed to delete testimonial: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessing(null);
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const stats = {
    total: testimonials.length,
    pending: testimonials.filter(t => t.status === 'pending').length,
    approved: testimonials.filter(t => t.status === 'approved').length,
  };

  return (
    <AdminLayout>
      <div className="testimonial-management">
        <div className="management-header">
          <h1>Testimonial Management</h1>
        
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <FaStar />
            </div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total Testimonials</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <FaClock />
            </div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>Pending Review</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon approved">
              <FaCheckCircle />
            </div>
            <div className="stat-info">
              <h3>{stats.approved}</h3>
              <p>Approved</p>
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
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({stats.approved})
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading testimonials...</div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="no-data">
            <p>No testimonials found</p>
          </div>
        ) : (
          <div className="testimonials-list">
            {filteredTestimonials.map((testimonial) => (
              <div key={testimonial.id} className={`testimonial-item ${testimonial.status}`}>
                <div className="testimonial-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {testimonial.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{testimonial.userName}</h3>
                    </div>
                  </div>
                </div>
                
                <p className="user-email">{testimonial.userEmail}</p>
                
                <div className="testimonial-meta">
                  <div className="rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="star" />
                    ))}
                  </div>
                  <span className={`status-badge ${testimonial.status}`}>
                    {testimonial.status}
                  </span>
                </div>

                <div className="testimonial-content">
                  <p>{testimonial.content}</p>
                </div>

                <div className="testimonial-footer">
                  <div className="testimonial-date">
                    <small>
                      Submitted: {new Date(testimonial.createdAt).toLocaleDateString()} {new Date(testimonial.createdAt).toLocaleTimeString()}
                    </small>
                    {testimonial.approvedAt && (
                      <small>
                        Approved: {new Date(testimonial.approvedAt).toLocaleDateString()}
                      </small>
                    )}
                  </div>

                  <div className="testimonial-actions">
                    {testimonial.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(testimonial.id!)}
                        className="approve-btn"
                        disabled={processing === testimonial.id}
                      >
                        <FaCheckCircle />
                        {processing === testimonial.id ? 'Processing...' : 'Approve'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(testimonial.id!)}
                      className="delete-btn"
                      disabled={processing === testimonial.id}
                    >
                      <FaTrash />
                      {processing === testimonial.id ? 'Deleting...' : 'Delete'}
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

export default TestimonialManagement;
