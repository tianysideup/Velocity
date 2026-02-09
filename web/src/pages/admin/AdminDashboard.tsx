import { useState, useEffect } from 'react';
import { getAllVehicles, type Vehicle } from '../../services/vehicleService';
import { getAllRentals, type Rental } from '../../services/rentalService';
import { FaCar, FaChartLine, FaReceipt, FaDollarSign } from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/admin/AdminDashboard.css';

const AdminDashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [vehicleData, rentalData] = await Promise.all([
        getAllVehicles(),
        getAllRentals()
      ]);
      setVehicles(vehicleData);
      setRentals(rentalData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter(v => v.available).length,
    unavailableVehicles: vehicles.filter(v => !v.available).length,
    averagePrice: vehicles.length > 0 
      ? Math.round(vehicles.reduce((sum, v) => sum + v.price, 0) / vehicles.length)
      : 0,
    totalRentals: rentals.filter(r => r.status === 'completed').length,
    activeRentals: rentals.filter(r => r.status === 'active').length,
    pendingRentals: rentals.filter(r => r.status === 'pending').length,
    totalRevenue: rentals.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.totalAmount || 0), 0)
  };

  return (
    <AdminLayout>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FaCar />
            </div>
            <div className="stat-info">
              <h3>{stats.totalVehicles}</h3>
              <p>Total Vehicles</p>
            </div>
          </div>

          <div className="stat-card available">
            <div className="stat-icon">
              <FaCar />
            </div>
            <div className="stat-info">
              <h3>{stats.availableVehicles}</h3>
              <p>Available</p>
            </div>
          </div>

          <div className="stat-card active-rentals">
            <div className="stat-icon">
              <FaReceipt />
            </div>
            <div className="stat-info">
              <h3>{stats.activeRentals}</h3>
              <p>Active Rentals</p>
            </div>
          </div>

          <div className="stat-card revenue">
            <div className="stat-icon">
              <FaDollarSign />
            </div>
            <div className="stat-info">
              <h3>₱{stats.totalRevenue.toFixed(0)}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="recent-vehicles">
          <h2>Recent Vehicles</h2>
          {loading ? (
            <div className="loading-text">Loading...</div>
          ) : (
            <div className="vehicles-table">
              <table>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Type</th>
                    <th>Price/Day</th>
                    <th>Rating</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.slice(0, 10).map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td>
                        <div className="vehicle-cell">
                          <img src={vehicle.image} alt={vehicle.name} />
                          <span>{vehicle.name}</span>
                        </div>
                      </td>
                      <td><span className="type-badge">{vehicle.type}</span></td>
                      <td>₱{vehicle.price}</td>
                      <td>{vehicle.rating} ⭐</td>
                      <td>
                        <span className={`status-badge ${vehicle.available ? 'available' : 'rented'}`}>
                          {vehicle.available ? 'Available' : 'Rented'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    );
  };

export default AdminDashboard;
