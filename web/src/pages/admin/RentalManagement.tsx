import { useState, useEffect } from 'react';
import { 
  getAllRentals, 
  updateRentalStatus, 
  deleteRental, 
  type Rental 
} from '../../services/rentalService';
import { adminDb } from '../../config/firebase';
import { 
  FaTrash, 
  FaEye,
  FaTimes,
  FaCalendar,
  FaCar,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaDollarSign
} from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/admin/RentalManagement.css';

const RentalManagement = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rentalToDelete, setRentalToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadRentals();
  }, []);

  useEffect(() => {
    filterRentals();
  }, [rentals, statusFilter]);

  const loadRentals = async () => {
    try {
      const data = await getAllRentals(adminDb);
      setRentals(data);
    } catch (error) {
      console.error('Error loading rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRentals = () => {
    let filtered = [...rentals];

    // Filter by status
    filtered = filtered.filter(rental => rental.status === statusFilter);

    setFilteredRentals(filtered);
  };

  const handleStatusChange = async (id: string, newStatus: Rental['status']) => {
    try {
      await updateRentalStatus(id, newStatus, adminDb);
      await loadRentals();
      
      // Show success message based on status
      if (newStatus === 'active') {
        alert('Rental approved! The vehicle is now with the customer.');
      } else if (newStatus === 'completed') {
        alert('Rental completed! The vehicle has been returned.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleDelete = (id: string) => {
    setRentalToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!rentalToDelete) return;

    try {
      setDeleting(true);
      await deleteRental(rentalToDelete, adminDb);
      await loadRentals();
      setShowDeleteModal(false);
      setRentalToDelete(null);
    } catch (error) {
      console.error('Error deleting rental:', error);
      alert('Failed to delete rental. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const viewDetails = (rental: Rental) => {
    setSelectedRental(rental);
    setShowDetailsModal(true);
  };

  const getStatusBadgeClass = (status: Rental['status']) => {
    const classes: Record<Rental['status'], string> = {
      pending: 'status-pending',
      active: 'status-active',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };
    return classes[status] || '';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <p>Loading rentals...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="rental-management">
        <div className="management-header">
          <h1>Rental Transactions</h1>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">Total Rentals</span>
              <span className="stat-value">{rentals.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active</span>
              <span className="stat-value">{rentals.filter(r => r.status === 'active').length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending</span>
              <span className="stat-value">{rentals.filter(r => r.status === 'pending').length}</span>
            </div>
          </div>
        </div>

        <div className="status-filter-buttons">
          <button
            className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>

        <div className="rentals-table-wrapper">
          <table className="rentals-table">
            <thead>
              <tr>
                <th>Confirmation #</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Pickup Date</th>
                <th>Return Date</th>
                <th>Days</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="no-data">
                    No rentals found
                  </td>
                </tr>
              ) : (
                filteredRentals.map((rental) => (
                  <tr key={rental.id}>
                    <td className="confirmation-cell">
                      <code>{rental.confirmationNumber}</code>
                    </td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">{rental.customerName}</span>
                        <span className="customer-email">{rental.customerEmail}</span>
                      </div>
                    </td>
                    <td>
                      <div className="vehicle-info">
                        <img src={rental.vehicleImage} alt={rental.vehicleName} />
                        <div>
                          <span className="vehicle-name">{rental.vehicleName}</span>
                          <span className="vehicle-type">{rental.vehicleType}</span>
                        </div>
                      </div>
                    </td>
                    <td>{new Date(rental.pickupDate).toLocaleDateString()}</td>
                    <td>{new Date(rental.returnDate).toLocaleDateString()}</td>
                    <td>{rental.numberOfDays}</td>
                    <td className="amount-cell">₱{rental.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(rental.status)}`}>
                        {rental.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {rental.status === 'pending' && (
                          <button
                            onClick={() => rental.id && handleStatusChange(rental.id, 'active')}
                            className="action-btn approve-btn"
                            title="Approve Rental"
                          >
                            Approve
                          </button>
                        )}
                        {rental.status === 'active' && (
                          <button
                            onClick={() => rental.id && handleStatusChange(rental.id, 'completed')}
                            className="action-btn complete-btn"
                            title="Complete Rental"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => viewDetails(rental)}
                          className="action-btn view-btn"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => rental.id && handleDelete(rental.id)}
                          className="action-btn delete-btn"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRental && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rental Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="close-btn">
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-section">
                  <h3><FaUser /> Customer Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedRental.customerName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label"><FaEnvelope /> Email:</span>
                    <span className="detail-value">{selectedRental.customerEmail}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label"><FaPhone /> Phone:</span>
                    <span className="detail-value">{selectedRental.customerPhone}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3><FaCar /> Vehicle Information</h3>
                  <div className="vehicle-preview">
                    <img src={selectedRental.vehicleImage} alt={selectedRental.vehicleName} />
                    <div>
                      <div className="detail-row">
                        <span className="detail-label">Vehicle:</span>
                        <span className="detail-value">{selectedRental.vehicleName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{selectedRental.vehicleType}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Daily Rate:</span>
                        <span className="detail-value">₱{selectedRental.dailyRate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3><FaCalendar /> Rental Period</h3>
                  <div className="detail-row">
                    <span className="detail-label">Pickup Date:</span>
                    <span className="detail-value">{new Date(selectedRental.pickupDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Return Date:</span>
                    <span className="detail-value">{new Date(selectedRental.returnDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{selectedRental.numberOfDays} {selectedRental.numberOfDays === 1 ? 'Day' : 'Days'}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3><FaDollarSign /> Payment Summary</h3>
                  <div className="detail-row">
                    <span className="detail-label">Subtotal:</span>
                    <span className="detail-value">₱{selectedRental.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="detail-row total-row">
                    <span className="detail-label">Total Amount:</span>
                    <span className="detail-value">₱{selectedRental.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <div className="detail-row">
                    <span className="detail-label">Confirmation Number:</span>
                    <code className="confirmation-code">{selectedRental.confirmationNumber}</code>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${getStatusBadgeClass(selectedRental.status)}`}>
                      {selectedRental.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">{selectedRental.createdAt.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button onClick={() => setShowDeleteModal(false)} className="close-btn" disabled={deleting}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this rental transaction? This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)} className="cancel-btn" disabled={deleting}>
                Cancel
              </button>
              <button onClick={confirmDelete} className="confirm-delete-btn" disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default RentalManagement;
