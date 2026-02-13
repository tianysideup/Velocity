import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaReceipt, FaTimes, FaCar, FaCalendar, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToUserRentals, type Rental } from '../services/rentalService';
import '../styles/NotificationsPage.css';

const NotificationsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const unsubscribe = subscribeToUserRentals(currentUser.uid, (data) => {
      setRentals(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  const viewReceipt = (rental: Rental) => {
    setSelectedRental(rental);
    setShowReceiptModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return '#666';
    }
  };

  // const getStatusIcon = (status: string) => {
  //   return 'checkmark-circle';
  // };

  const currentRentals = rentals.filter(r => r.status === 'pending' || r.status === 'active');
  const completedRentals = rentals.filter(r => r.status === 'completed');

  const renderRentalCard = (rental: Rental) => (
    <div key={rental.id} className="rental-card">
      <div className="rental-card-header">
        <span 
          className="rental-status"
          style={{ backgroundColor: getStatusColor(rental.status) }}
        >
          {rental.status.toUpperCase()}
        </span>
        <span className="rental-date">
          {new Date(rental.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="rental-card-body">
        <div className="rental-vehicle-info">
          <img src={rental.vehicleImage} alt={rental.vehicleName} className="rental-vehicle-image" />
          <div>
            <h3>{rental.vehicleName}</h3>
            <p className="rental-type">{rental.vehicleType}</p>
            <p className="rental-confirmation">#{rental.confirmationNumber}</p>
          </div>
        </div>

        <div className="rental-details">
          <div className="rental-detail-item">
            <FaCalendar />
            <span>
              {new Date(rental.pickupDate).toLocaleDateString()} - {new Date(rental.returnDate).toLocaleDateString()}
            </span>
          </div>
          <div className="rental-detail-item">
            <span className="rental-amount">₱{rental.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="rental-card-footer">
        <button 
          onClick={() => viewReceipt(rental)}
          className="view-receipt-btn"
        >
          <FaReceipt /> View Receipt
        </button>
      </div>
    </div>
  );

  return (
    <div className="notifications-page">
      <div className="notifications-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your rentals...</p>
          </div>
        ) : rentals.length === 0 ? (
          <div className="empty-state">
            <FaCar className="empty-icon" />
            <h2>No Rentals Yet</h2>
            <p>Your rental history will appear here</p>
            <button onClick={() => navigate('/rentals')} className="browse-btn">
              Browse Vehicles
            </button>
          </div>
        ) : (
          <>
            {currentRentals.length > 0 && (
              <div className="rental-section">
                <h2 className="section-title">Current Rental</h2>
                <div className="rentals-grid">
                  {currentRentals.map(renderRentalCard)}
                </div>
              </div>
            )}

            {completedRentals.length > 0 && (
              <div className="rental-section">
                <h2 className="section-title">Completed Rentals</h2>
                <div className="rentals-grid">
                  {completedRentals.map(renderRentalCard)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedRental && showReceiptModal && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-modal-header">
              <h2>Rental Receipt</h2>
              <button onClick={() => setShowReceiptModal(false)} className="close-modal-btn">
                <FaTimes />
              </button>
            </div>

            <div className="receipt-modal-body">
              <div className="receipt-status-banner" style={{ backgroundColor: getStatusColor(selectedRental.status) }}>
                <span>{selectedRental.status.toUpperCase()}</span>
              </div>

              <div className="receipt-confirmation">
                <p className="receipt-label">Confirmation Number</p>
                <h3>{selectedRental.confirmationNumber}</h3>
              </div>

              <div className="receipt-section">
                <h4><FaCar /> Vehicle Details</h4>
                <div className="receipt-row">
                  <span>Vehicle:</span>
                  <span>{selectedRental.vehicleName}</span>
                </div>
                <div className="receipt-row">
                  <span>Type:</span>
                  <span>{selectedRental.vehicleType}</span>
                </div>
                <div className="receipt-row">
                  <span>Daily Rate:</span>
                  <span>₱{selectedRental.dailyRate}/day</span>
                </div>
              </div>

              <div className="receipt-section">
                <h4><FaCalendar /> Rental Period</h4>
                <div className="receipt-row">
                  <span>Pickup Date:</span>
                  <span>{new Date(selectedRental.pickupDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="receipt-row">
                  <span>Return Date:</span>
                  <span>{new Date(selectedRental.returnDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="receipt-row">
                  <span>Duration:</span>
                  <span>{selectedRental.numberOfDays} {selectedRental.numberOfDays === 1 ? 'day' : 'days'}</span>
                </div>
              </div>

              <div className="receipt-section">
                <h4><FaUser /> Customer Information</h4>
                <div className="receipt-row">
                  <span>Name:</span>
                  <span>{selectedRental.customerName}</span>
                </div>
                <div className="receipt-row">
                  <span><FaEnvelope /> Email:</span>
                  <span>{selectedRental.customerEmail}</span>
                </div>
                <div className="receipt-row">
                  <span><FaPhone /> Phone:</span>
                  <span>{selectedRental.customerPhone}</span>
                </div>
              </div>

              <div className="receipt-section">
                <h4>Payment Summary</h4>
                <div className="receipt-row">
                  <span>Subtotal:</span>
                  <span>₱{selectedRental.subtotal.toFixed(2)}</span>
                </div>
                <div className="receipt-total">
                  <span>Total Amount:</span>
                  <span>₱{selectedRental.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="receipt-footer">
                <p>Created: {new Date(selectedRental.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
