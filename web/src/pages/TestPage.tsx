import { useState } from 'react';
import { initializeVehicles } from '../utils/initializeVehicles';
import { getAllVehicles, type Vehicle } from '../services/vehicleService';

const TestPage = () => {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [message, setMessage] = useState('');

  const handleInitialize = async () => {
    setLoading(true);
    setMessage('');
    try {
      console.log('🧪 Test: Starting manual vehicle initialization...');
      await initializeVehicles();
      setMessage('✅ Vehicles initialized successfully!');
      
      // Fetch and display vehicles
      const allVehicles = await getAllVehicles();
      setVehicles(allVehicles);
      console.log('🧪 Test: Vehicles after initialization:', allVehicles);
    } catch (error) {
      console.error('🧪 Test: Error during initialization:', error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
    setLoading(false);
  };

  const handleFetchVehicles = async () => {
    setLoading(true);
    try {
      console.log('🧪 Test: Fetching vehicles...');
      const allVehicles = await getAllVehicles();
      setVehicles(allVehicles);
      setMessage(`✅ Found ${allVehicles.length} vehicles`);
      console.log('🧪 Test: Fetched vehicles:', allVehicles);
    } catch (error) {
      console.error('🧪 Test: Error fetching vehicles:', error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Vehicle Testing Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleFetchVehicles}
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px 20px' }}
        >
          {loading ? 'Loading...' : 'Fetch Vehicles'}
        </button>
        
        <button 
          onClick={handleInitialize}
          disabled={loading}
          style={{ padding: '10px 20px' }}
        >
          {loading ? 'Loading...' : 'Initialize Vehicles'}
        </button>
      </div>

      {message && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px',
          backgroundColor: message.includes('❌') ? '#ffebee' : '#e8f5e8',
          border: `1px solid ${message.includes('❌') ? '#ffcdd2' : '#c8e6c8'}`,
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}

      <div>
        <h3>Vehicles Found: {vehicles.length}</h3>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {JSON.stringify(vehicles, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>📝 Instructions:</p>
        <ul>
          <li>Click "Fetch Vehicles" to see what vehicles are currently in the database</li>
          <li>Click "Initialize Vehicles" to add sample vehicles if none exist</li>
          <li>Check the browser console for detailed logging</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPage;