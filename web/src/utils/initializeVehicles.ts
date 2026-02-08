import { addVehicle, type Vehicle } from '../services/vehicleService';

const SAMPLE_VEHICLES: Omit<Vehicle, 'id'>[] = [
  {
    name: 'Ford Mustang',
    type: 'sports',
    price: 220,
    image: '/img/Ford Mustang.png',
    rating: 4.8,
    description: 'Iconic muscle with modern comfort and performance.',
    available: true
  },
  {
    name: 'Land Cruiser',
    type: 'suv',
    price: 190,
    image: '/img/Land Cruiser.png',
    rating: 4.6,
    description: 'Rugged capability with premium interior space.',
    available: true
  },
  {
    name: 'City Glide',
    type: 'sedan',
    price: 95,
    image: '/img/Ford Mustang.png',
    rating: 4.4,
    description: 'Smooth daily driver with great mileage.',
    available: true
  },
  {
    name: 'Volt Runner',
    type: 'electric',
    price: 150,
    image: '/img/Land Cruiser.png',
    rating: 4.7,
    description: 'Quiet, fast, and efficient electric experience.',
    available: true
  },
  {
    name: 'Luxe Meridian',
    type: 'luxury',
    price: 260,
    image: '/img/Ford Mustang.png',
    rating: 4.9,
    description: 'Premium comfort with a refined ride.',
    available: true
  }
];

export const initializeVehicles = async (): Promise<void> => {
  await Promise.all(SAMPLE_VEHICLES.map((vehicle) => addVehicle(vehicle)));
};
