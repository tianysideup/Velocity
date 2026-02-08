import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaFilter, FaSearch, FaStar } from 'react-icons/fa';
import { getAllVehicles, type Vehicle } from '../services/vehicleService';
import { initializeVehicles } from '../utils/initializeVehicles';
import '../styles/RentalsPage.css';

const RentalsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const startTime = Date.now();
      
      const data = await getAllVehicles();
      
      // If no vehicles exist, initialize with sample data
      if (data.length === 0) {
        await initializeVehicles();
        const newData = await getAllVehicles();
        setVehicles(newData);
      } else {
        setVehicles(data);
      }
      setError(null);
      
      // Ensure loading screen shows for at least 1.5 seconds
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1500 - elapsedTime);
      
      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setError('Failed to load vehicles. Please try again.');
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || vehicle.type === selectedType;
    
    let matchesPrice = true;
    if (priceRange === 'low') matchesPrice = vehicle.price < 100;
    if (priceRange === 'mid') matchesPrice = vehicle.price >= 100 && vehicle.price < 200;
    if (priceRange === 'high') matchesPrice = vehicle.price >= 200;

    return matchesSearch && matchesType && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="rentals-page">
      <div className="rentals-header">
        <h1>Available Rentals</h1>
        <p>Find the perfect vehicle for your journey</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadVehicles}>Try Again</button>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <img src="/img/LoadingScreen.png" alt="Loading" className="loading-image" />
          <p>Loading vehicles...</p>
        </div>
      ) : (
        <div className="rentals-content">
        <aside className="filters-sidebar">
          <div className="filters-header">
            <FaFilter />
            <h2>Filters</h2>
          </div>

          <div className="filter-group">
            <label>Vehicle Type</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="electric">Electric</option>
              <option value="sports">Sports</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range</label>
            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
              <option value="all">All Prices</option>
              <option value="low">Under $100/day</option>
              <option value="mid">$100 - $200/day</option>
              <option value="high">$200+/day</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <button className="clear-filters" onClick={() => {
            setSelectedType('all');
            setPriceRange('all');
            setSortBy('featured');
            setSearchTerm('');
          }}>
            Clear All Filters
          </button>
        </aside>

        <main className="vehicles-section">
          <div className="search-filter-container">
            <div className="search-bar">
              <FaSearch />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter />
              <span>Filters</span>
            </button>

            {/* Dropdown Filters for Tablet/Laptop */}
            <div className={`filters-dropdown ${showFilters ? 'show' : ''}`}>
              <div className="filter-group">
                <label>Vehicle Type</label>
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="electric">Electric</option>
                  <option value="sports">Sports</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Price Range</label>
                <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
                  <option value="all">All Prices</option>
                  <option value="low">Under $100/day</option>
                  <option value="mid">$100 - $200/day</option>
                  <option value="high">$200+/day</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              <button className="clear-filters" onClick={() => {
                setSelectedType('all');
                setPriceRange('all');
                setSortBy('featured');
                setSearchTerm('');
              }}>
                Clear All Filters
              </button>
            </div>
          </div>

          <div className="results-info">
            <p>{filteredVehicles.length} vehicles available</p>
          </div>

          <div className="vehicles-grid">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className={`vehicle-card ${!vehicle.available ? 'unavailable' : ''}`}>
                <div className="vehicle-image">
                  <img src={vehicle.image} alt={vehicle.name} />
                  <div className="vehicle-type">{vehicle.type.toUpperCase()}</div>
                  {!vehicle.available && <div className="unavailable-badge">Currently Unavailable</div>}
                  <div className="rating-badge">
                    <FaStar /> {vehicle.rating}
                  </div>
                </div>
                <div className="vehicle-info">
                  <h3>{vehicle.name}</h3>
                  <p className="vehicle-description">{vehicle.description}</p>
                  <div className="vehicle-footer">
                    <div className="price">
                      <span className="amount">${vehicle.price}</span>
                      <span className="period">/day</span>
                    </div>
                    <button 
                      className="book-btn" 
                      disabled={!vehicle.available}
                      onClick={() => vehicle.available && navigate(`/vehicle/${vehicle.id}`)}
                    >
                      {vehicle.available ? 'Book Now' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredVehicles.length === 0 && !loading && (
            <div className="no-results">
              <FaCar />
              <h3>No vehicles found</h3>
              <p>Try adjusting your filters or search criteria</p>
            </div>
          )}
        </main>
      </div>
      )}
    </div>
  );
};

export default RentalsPage;
