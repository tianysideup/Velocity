import { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import { submitContactMessage } from '../services/contactService';
import '../styles/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await submitContactMessage(formData);
      setSuccess('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error('Error submitting message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="contact">
      <div className="contact-container">
        <div className="contact-header">
          <h2 className="section-title">Contact Us</h2>
          <p className="section-subtitle">
            Ready to get started? Get in touch and we'll help you find the perfect rental solution.
          </p>
        </div>

        <div className="contact-content">
          <div className="contact-left">
            <div className="contact-info-cards">
              <div className="info-card">
                <div className="info-card-icon">
                  <FaPhone />
                </div>
                <div className="info-card-content">
                  <h4>Call Us</h4>
                  <p>(555) 123-4567</p>
                  <span className="info-label">Mon-Sat, 8AM-6PM</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-icon">
                  <FaEnvelope />
                </div>
                <div className="info-card-content">
                  <h4>Email Us</h4>
                  <p>info@velocity.com</p>
                  <span className="info-label">We'll respond within 24hrs</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="info-card-content">
                  <h4>Visit Us</h4>
                  <p>123 Business District</p>
                  <span className="info-label">Your City, ST 12345</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-icon">
                  <FaClock />
                </div>
                <div className="info-card-content">
                  <h4>Working Hours</h4>
                  <p>Mon - Fri: 8AM - 6PM</p>
                  <span className="info-label">Sat: 9AM - 4PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-right">
            <div className="form-wrapper">
              <h3 className="form-title">Send us a message</h3>
              
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your rental needs..."
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
