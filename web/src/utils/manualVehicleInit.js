// Quick manual initialization script for vehicles
// Run this in browser console if vehicles aren't showing

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  // Add your config here if needed
};

const vehicles = [
  {
    name: 'Ford Mustang',
    type: 'sports',
    price: 220,
    image: '/img/Ford%20Mustang.png',
    rating: 4.8,
    description: 'Iconic muscle with modern comfort and performance.',
    available: true
  },
  {
    name: 'Land Cruiser',
    type: 'suv', 
    price: 190,
    image: '/img/Land%20Cruiser.png',
    rating: 4.6,
    description: 'Rugged capability with premium interior space.',
    available: true
  },
  {
    name: 'City Glide',
    type: 'sedan',
    price: 95,
    image: '/img/Ford%20Mustang.png',
    rating: 4.4,
    description: 'Smooth daily driver with great mileage.',
    available: true
  },
  {
    name: 'Volt Runner',
    type: 'electric',
    price: 150,
    image: '/img/Land%20Cruiser.png',
    rating: 4.7,
    description: 'Quiet, fast, and efficient electric experience.',
    available: true
  },
  {
    name: 'Luxe Meridian',
    type: 'luxury',
    price: 260,
    image: '/img/Ford%20Mustang.png',
    rating: 4.9,
    description: 'Premium comfort with a refined ride.',
    available: true
  }
];

// Manual initialization function
window.initVehicles = async () => {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Check if vehicles already exist
    const existing = await getDocs(collection(db, 'vehicles'));
    if (existing.docs.length === 0) {
      console.log('Adding vehicles to database...');
      
      for (const vehicle of vehicles) {
        await addDoc(collection(db, 'vehicles'), vehicle);
      }
      
      console.log('Vehicles added successfully!');
      window.location.reload();
    } else {
      console.log('Vehicles already exist:', existing.docs.length);
    }
  } catch (error) {
    console.error('Error initializing vehicles:', error);
  }
};

console.log('To manually add vehicles, run: initVehicles()');