import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { 
  getAllVehiclesForAdmin, 
  addVehicle, 
  updateVehicle, 
  deleteVehicle, 
  type Vehicle 
} from '../../services/vehicleService';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaTimes,
  FaImage,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/admin/VehicleManagement.css';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'sedan',
    price: 0,
    image: '',
    rating: 5,
    description: '',
    available: true
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await getAllVehiclesForAdmin();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        name: vehicle.name,
        type: vehicle.type,
        price: vehicle.price,
        image: vehicle.image,
        rating: vehicle.rating,
        description: vehicle.description,
        available: vehicle.available
      });
      setImagePreview(vehicle.image);
      setSelectedFile(null);
    } else {
      setEditingVehicle(null);
      setFormData({
        name: '',
        type: 'sedan',
        price: 0,
        image: '',
        rating: 5,
        description: '',
        available: true
      });
      setImagePreview('');
      setSelectedFile(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
    setSelectedFile(null);
    setImagePreview('');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB for Firestore storage)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be under 2MB. Please choose a smaller image.');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setFormData(prev => ({...prev, image: base64}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      
      if (!formData.image) {
        alert('Please select an image for the vehicle.');
        setUploading(false);
        return;
      }
      
      const vehicleData = { ...formData };
      
      if (editingVehicle && editingVehicle.id) {
        await updateVehicle(editingVehicle.id, vehicleData);
      } else {
        await addVehicle(vehicleData);
      }
      
      await loadVehicles();
      closeModal();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert(`Failed to save vehicle. Please try again.`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    setVehicleToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;

    try {
      setDeleting(true);
      await deleteVehicle(vehicleToDelete);
      await loadVehicles();
      setShowDeleteModal(false);
      setVehicleToDelete(null);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Failed to delete vehicle. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setVehicleToDelete(null);
  };

  const toggleAvailability = async (vehicle: Vehicle) => {
    if (!vehicle.id) return;
    try {
      await updateVehicle(vehicle.id, { available: !vehicle.available });
      await loadVehicles();
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Failed to update availability. Please try again.');
    }
  };

  return (
    <AdminLayout>
      <div className="management-header">
        <h1>Vehicle Management</h1>
        <button onClick={() => openModal()} className="add-vehicle-btn">
          <FaPlus /> Add New Vehicle
        </button>
      </div>

        {loading ? (
          <div className="loading-text">Loading vehicles...</div>
        ) : (
          <div className="vehicles-grid-admin">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="vehicle-card-admin">
                <img src={vehicle.image} alt={vehicle.name} />
                <div className="vehicle-info-admin">
                  <h3>{vehicle.name}</h3>
                  <div className="vehicle-details">
                    <span className="type-badge">{vehicle.type}</span>
                    <span className="price">₱{vehicle.price}/day</span>
                  </div>
                  <p className="description">{vehicle.description}</p>
                  <div className="status">
                    <span className={`status-badge ${vehicle.available ? 'available' : 'rented'}`}>
                      {vehicle.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="vehicle-actions">
                    <button 
                      onClick={() => toggleAvailability(vehicle)} 
                      className={`availability-toggle-btn ${vehicle.available ? 'available' : 'unavailable'}`}
                      title={vehicle.available ? 'Set to Unavailable' : 'Set to Available'}
                    >
                      {vehicle.available ? <FaToggleOn /> : <FaToggleOff />}
                      {vehicle.available ? 'Available' : 'Unavailable'}
                    </button>
                    <button onClick={() => openModal(vehicle)} className="edit-btn">
                      <FaEdit /> Edit
                    </button>
                    <button 
                      onClick={() => vehicle.id && handleDelete(vehicle.id)} 
                      className="delete-btn"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
              <button onClick={closeModal} className="close-btn">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="vehicle-form">
              <div className="form-group">
                <label>Vehicle Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., Toyota Camry"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="electric">Electric</option>
                    <option value="sports">Sports</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price per Day (₱)</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setFormData({...formData, price: value ? Number(value) : 0});
                    }}
                    required
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Vehicle Image *</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="vehicle-image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <label htmlFor="vehicle-image" className="file-input-label">
                    <FaImage />
                    <span>{selectedFile ? selectedFile.name : 'Choose an image from your device'}</span>
                  </label>
                  
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.available ? 'available' : 'rented'}
                    onChange={(e) => setFormData({...formData, available: e.target.value === 'available'})}
                  >
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows={3}
                  placeholder="Brief description of the vehicle"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={closeModal} className="cancel-btn" disabled={uploading}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={uploading}>
                  {uploading ? 'Saving...' : (editingVehicle ? 'Update Vehicle' : 'Add Vehicle')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h2>Delete Vehicle</h2>
            </div>
            <div className="delete-modal-body">
              <p>Are you sure you want to delete this vehicle? This action cannot be undone.</p>
            </div>
            <div className="delete-modal-actions">
              <button onClick={cancelDelete} className="cancel-delete-btn" disabled={deleting}>
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

export default VehicleManagement;
