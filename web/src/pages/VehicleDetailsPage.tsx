import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCar, FaGasPump, FaCog, FaCheck, FaTimes, FaDownload } from 'react-icons/fa';
import { getAllVehiclesForAdmin, type Vehicle } from '../services/vehicleService';
import { addRental } from '../services/rentalService';
import { useAuth } from '../contexts/AuthContext';
import '../styles/VehicleDetailsPage.css';
import ConfirmationModal from '../components/ConfirmationModal';
import '../styles/ConfirmationModal.css';

const VehicleDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTransaction, setShowTransaction] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const isFormValid = () => {
    return pickupDate && returnDate && fullName.trim() && phoneNumber.trim();
  };

  const calculateDays = () => {
    if (!pickupDate || !returnDate) return 1;
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const diffTime = Math.abs(returnD.getTime() - pickup.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const days = calculateDays();
  const subtotal = vehicle ? vehicle.price * days : 0;
  const total = subtotal;

  useEffect(() => {
    loadVehicle();
  }, [id]);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.name || '');
      setPhoneNumber(userProfile.phone || '');
    }
  }, [userProfile]);

  const loadVehicle = async () => {
    try {
      // Use getAllVehiclesForAdmin to find the vehicle even if it's currently reserved
      const vehicles = await getAllVehiclesForAdmin();
      const found = vehicles.find(v => v.id === id);
      setVehicle(found || null);
    } catch (error) {
      console.error('Error loading vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateConfirmationNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `VR${timestamp}${random}`.substring(0, 16).toUpperCase();
  };

  const handleConfirmReservation = () => {
    setIsModalOpen(true);
  };

  const proceedWithReservation = async () => {
    if (!vehicle || !currentUser) return;

    try {
      const confNumber = generateConfirmationNumber();
      setConfirmationNumber(confNumber);

      // Save rental transaction to database
      await addRental({
        confirmationNumber: confNumber,
        vehicleId: vehicle.id || '',
        userId: currentUser.uid,
        vehicleName: vehicle.name,
        vehicleType: vehicle.type,
        vehicleImage: vehicle.image,
        dailyRate: vehicle.price,
        customerName: fullName,
        customerEmail: currentUser.email || '',
        customerPhone: phoneNumber,
        pickupDate: pickupDate,
        returnDate: returnDate,
        numberOfDays: days,
        subtotal: subtotal,
        totalAmount: total,
        status: 'pending',
        createdAt: new Date()
      });

      setShowReceipt(true);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving rental:', error);
      alert('Failed to confirm reservation. Please try again.');
      setIsModalOpen(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  const handleCloseReceipt = () => {
    // Reset form states
    setShowReceipt(false);
    setPickupDate('');
    setReturnDate('');
    setFullName('');
    setPhoneNumber(currentUser?.phoneNumber || '');
    setConfirmationNumber('');
    setShowTransaction(false);
    
    // Redirect to rentals page
    navigate('/rentals');
  };

  if (loading) {
    return (
      <div className="vehicle-details-loading">
        <p>Loading vehicle details...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="vehicle-not-found">
        <h2>Vehicle not found</h2>
      </div>
    );
  }

  return (
    <div className="vehicle-details-page">
      <div className="breadcrumbs">
        <span onClick={() => navigate('/')} className="breadcrumb-link">Home</span>
        <span className="breadcrumb-separator">/</span>
        <span onClick={() => navigate('/rentals')} className="breadcrumb-link">Rentals</span>
        <span className="breadcrumb-separator">/</span>
        <span onClick={() => !showTransaction && navigate(`/vehicle/${id}`)} className={!showTransaction ? "breadcrumb-link" : "breadcrumb-current"}>{vehicle.name}</span>
        {showTransaction && (
          <>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Book Now</span>
          </>
        )}
      </div>

      {!showTransaction ? (
        <div className="details-container">
          <div className="details-content">
            <div className="image-section">
              <div className="main-image">
                <img src={vehicle.image} alt={vehicle.name} />
                {!vehicle.available && (
                  <div className="unavailable-overlay">
                    <span>Currently Unavailable</span>
                  </div>
                )}
              </div>
            </div>

            <div className="info-section">
              <div className="header-row">
                <div className="title-block">
                  <span className="vehicle-type-badge">{vehicle.type}</span>
                  <h1>{vehicle.name}</h1>
                </div>
              </div>

              <div className="specs-row">
                <div className="spec-item">
                  <FaCar />
                  <span>{vehicle.type}</span>
                </div>
                <div className="spec-item">
                  <FaGasPump />
                  <span>Gasoline</span>
                </div>
                <div className="spec-item">
                  <FaCog />
                  <span>Automatic</span>
                </div>
              </div>

              <div className="features-section">
                <h3>What's Included</h3>
                <div className="features-grid">
                  <span><FaCheck /> Air Conditioning</span>
                  <span><FaCheck /> Bluetooth</span>
                  <span><FaCheck /> GPS Navigation</span>
                  <span><FaCheck /> Backup Camera</span>
                  <span><FaCheck /> Cruise Control</span>
                  <span><FaCheck /> USB Ports</span>
                </div>
              </div>

              <div className="terms-row">
              
                <span>License required</span>
             
              </div>

              <div className="pricing-section">
                <div className="price-display">
                  <span className="price-amount">₱{vehicle.price}</span>
                  <span className="price-period">/day</span>
                </div>
                <button 
                  className="book-now-button" 
                  disabled={!vehicle.available}
                  onClick={() => {
                    if (vehicle.available) {
                      if (!currentUser) {
                        navigate('/login');
                      } else {
                        setShowTransaction(true);
                      }
                    }
                  }}
                >
                  {vehicle.available ? 'Reserve Now' : 'Unavailable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="summary-containers-wrapper">
          <div className="details-container form-container">
            <div className="transaction-content">
              <h2>Complete Your Reservation</h2>
              <div className="booking-form">
                <div className="form-section">
                  <h3>Rental Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Pick-up Date</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="form-group">
                      <label>Return Date</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        min={pickupDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="John Doe" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" className="form-input" value={currentUser?.email || ''} readOnly />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input 
                        type="tel" 
                        className="form-input" 
                        value={phoneNumber} 
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, '');
                          if (digitsOnly.length <= 11) {
                            setPhoneNumber(digitsOnly);
                          }
                        }}
                        placeholder="09123456789" 
                        maxLength={11}
                        required
                      />
                      <small style={{fontSize: '0.8rem', color: '#666', marginTop: '0.25rem', display: 'block'}}>{phoneNumber.length}/11 digits</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="details-container summary-container">
              <div className="transaction-content">
                <div className="booking-summary">
                  <h3>Booking Summary</h3>
                  
                  <div className="summary-vehicle">
                    <img src={vehicle.image} alt={vehicle.name} />
                    <div>
                      <h4>{vehicle.name}</h4>
                      <p>{vehicle.type}</p>
                    </div>
                  </div>

                  <div className="summary-details">
                    <div className="summary-row">
                      <span>Daily Rate</span>
                      <span>${vehicle.price}</span>
                    </div>
                    <div className="summary-row">
                      <span>Number of Days</span>
                    <span>{days}</span>
                  </div>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₱{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row summary-total">
                    <span>Total Amount</span>
                    <span>₱{total.toFixed(0)}</span>
                    </div>
                  </div>

                  <button 
                    className="confirm-button" 
                    onClick={handleConfirmReservation}
                    disabled={!isFormValid()}
                  >
                    Confirm Reservation
                  </button>


                </div>
              </div>
            </div>
          </div>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={proceedWithReservation}
        message="Are you sure you want to confirm this reservation?"
      />

      {showReceipt && vehicle && (
        <div className="receipt-modal-overlay" onClick={handleCloseReceipt}>
          <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={handleCloseReceipt}>
              <FaTimes />
            </button>
            
            <div className="receipt-actions no-print">
              <button className="action-button" onClick={handleDownload}>
                <FaDownload /> Download
              </button>
            </div>

            <div className="receipt-content" ref={receiptRef}>
              <div className="receipt-header">
                <h2>RENTAL CONFIRMATION RECEIPT</h2>
                <div className="receipt-logo">Velocity</div>
              </div>

              <div className="receipt-info">
                <div className="info-row">
                  <span className="label">Confirmation Number:</span>
                  <span className="value confirmation-number">{confirmationNumber}</span>
                </div>
                <div className="info-row">
                  <span className="label">Date Issued:</span>
                  <span className="value">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="receipt-section">
                <h3>Customer Information</h3>
                <div className="section-content">
                  <div className="info-row">
                    <span className="label">Name:</span>
                    <span className="value">{fullName || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span className="value">{currentUser?.email || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{phoneNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="receipt-section">
                <h3>Vehicle Information</h3>
                <div className="section-content">
                  <div className="info-row">
                    <span className="label">Vehicle:</span>
                    <span className="value">{vehicle.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Type:</span>
                    <span className="value">{vehicle.type}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Daily Rate:</span>
                    <span className="value">₱{vehicle.price}</span>
                  </div>
                </div>
              </div>

              <div className="receipt-section">
                <h3>Rental Period</h3>
                <div className="section-content">
                  <div className="info-row">
                    <span className="label">Pick-up Date:</span>
                    <span className="value">{pickupDate ? new Date(pickupDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Return Date:</span>
                    <span className="value">{returnDate ? new Date(returnDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Duration:</span>
                    <span className="value">{days} {days === 1 ? 'Day' : 'Days'}</span>
                  </div>
                </div>
              </div>

              <div className="receipt-section">
                <h3>Payment Summary</h3>
                <div className="section-content">
                  <div className="info-row">
                    <span className="label">Subtotal ({days} {days === 1 ? 'day' : 'days'} × ₱{vehicle.price}):</span>
                    <span className="value">₱{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="receipt-divider"></div>
                  <div className="info-row total-row">
                    <span className="label">Total Amount:</span>
                    <span className="value">₱{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="receipt-footer">
                <p className="important-notice">IMPORTANT: Please present this confirmation receipt at our store to complete your reservation.</p>
                <p className="terms">Terms & Conditions: Valid driver's license required. Payment due at vehicle pick-up. Free cancellation within 24 hours.</p>
                <p className="thank-you">Thank you for choosing Velocity!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetailsPage;
