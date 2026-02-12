import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getApprovedTestimonials, submitTestimonial, type Testimonial } from '../services/testimonialService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FaChevronLeft, FaChevronRight, FaQuoteLeft } from 'react-icons/fa';
import '../styles/Testimonials.css';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const { currentUser } = useAuth();

  const testimonialsPerPage = 4;
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);
  const startIndex = currentPage * testimonialsPerPage;
  const endIndex = startIndex + testimonialsPerPage;
  const currentTestimonials = testimonials.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    loadTestimonials();
    
    // Auto-refresh every 30 seconds when the section is visible
    const intervalId = setInterval(() => {
      loadTestimonials();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const data = await getApprovedTestimonials();
      console.log('Loaded testimonials:', data);
      setTestimonials(data);
    } catch (error) {
      console.error('Error loading testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to submit a testimonial');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Get user name from Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userName = userDoc.exists() ? userDoc.data().name : currentUser.email?.split('@')[0] || 'Anonymous';

      await submitTestimonial({
        userId: currentUser.uid,
        userName,
        userEmail: currentUser.email || '',
        content,
        rating,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      setSuccess('Thank you! Your testimonial has been submitted for review.');
      setShowSuccessAnimation(true);
      setContent('');
      setRating(5);
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
        setShowSuccessAnimation(false);
        loadTestimonials(); // Refresh the list
      }, 2500);
    } catch (error) {
      setError('Failed to submit testimonial. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="testimonials" className="testimonials">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <div>
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="section-subtitle">
              Real experiences from real customers who trust Velocity
            </p>
          </div>
          {currentUser && (
            <button 
              className="submit-testimonial-btn"
              onClick={() => setShowModal(true)}
            >
              Share Your Experience
            </button>
          )}
        </div>

        {loading ? (
          <div className="testimonials-loading">Loading testimonials...</div>
        ) : testimonials.length === 0 ? (
          <div className="no-testimonials">
            <p>No testimonials yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="testimonials-wrapper">
            {testimonials.length > testimonialsPerPage && (
              <button 
                className="testimonial-nav-btn prev" 
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                aria-label="Previous testimonials"
              >
                <FaChevronLeft />
              </button>
            )}
            
            <div className="testimonials-grid">
              {currentTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="testimonial-card">
                  <div className="quote-icon">
                    <FaQuoteLeft />
                  </div>
                  <div className="card-content">
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="star">★</span>
                      ))}
                    </div>
                    <p className="testimonial-content">"{testimonial.content}"</p>
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      {testimonial.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="author-info">
                      <h4>{testimonial.userName}</h4>
                      <p>Verified Customer</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {testimonials.length > testimonialsPerPage && (
              <button 
                className="testimonial-nav-btn next" 
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                aria-label="Next testimonials"
              >
                <FaChevronRight />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Testimonial Submission Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Share Your Experience</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && (
              <div className="success-message">
                {showSuccessAnimation && (
                  <div className="success-checkmark">
                    <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                      <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                      <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                    </svg>
                  </div>
                )}
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="testimonial-form">
              <div className="form-group">
                <label>Rating</label>
                <div className="rating-selector">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${rating >= star ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="content">Your Testimonial</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  minLength={10}
                  placeholder="Share your experience with Velocity..."
                  rows={5}
                />
                <small>{content.length} characters</small>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={submitting || content.length < 10}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;
