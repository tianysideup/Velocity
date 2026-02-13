import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, type Firestore } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Vehicle {
  id?: string;
  name: string;
  type: string;
  price: number;
  image: string;
  rating: number;
  description: string;
  available: boolean;
}

const COLLECTION_NAME = 'vehicles';

// Get all vehicles (excluding reserved ones)
export const getAllVehicles = async (): Promise<Vehicle[]> => {
  try {
    console.log('🔥 Fetching vehicles from Firestore...');
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    console.log('🔥 Raw vehicle docs:', querySnapshot.docs.length);
    const allVehicles = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Vehicle));
    console.log('🔥 Parsed vehicles:', allVehicles);

    // Try to get reserved vehicle IDs, but don't fail if we can't access rentals
    try {
      console.log('🔥 Trying to fetch rentals to filter reserved vehicles...');
      const rentalsQuery = query(
        collection(db, 'rentals'),
        where('status', 'in', ['pending', 'active'])
      );
      const rentalsSnapshot = await getDocs(rentalsQuery);
      console.log('🔥 Rentals data:', rentalsSnapshot.docs.length);
      const reservedVehicleIds = new Set(
        rentalsSnapshot.docs.map(doc => doc.data().vehicleId)
      );

      // Filter out reserved vehicles if we have access to rentals data
      const filtered = allVehicles.filter(vehicle => !reservedVehicleIds.has(vehicle.id));
      console.log('🔥 Filtered vehicles (excluding reserved):', filtered);
      return filtered;
    } catch (rentalsError) {
      // If we can't access rentals (user not authenticated), just return all vehicles
      console.log('🔥 Could not access rentals data (user not authenticated), returning all vehicles');
      return allVehicles;
    }
  } catch (error) {
    console.error('🔥❌ Error getting vehicles:', error);
    throw error;
  }
};

// Get all vehicles including reserved ones (for admin)
export const getAllVehiclesForAdmin = async (firestore: Firestore = db): Promise<Vehicle[]> => {
  try {
    const querySnapshot = await getDocs(collection(firestore, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Vehicle));
  } catch (error) {
    console.error('Error getting vehicles for admin:', error);
    throw error;
  }
};

// Add a new vehicle
export const addVehicle = async (vehicle: Omit<Vehicle, 'id'>, firestore: Firestore = db): Promise<string> => {
  try {
    console.log('📝 Adding vehicle to Firestore:', vehicle.name);
    const docRef = await addDoc(collection(firestore, COLLECTION_NAME), vehicle);
    console.log('✅ Vehicle added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding vehicle:', error);
    throw error;
  }
};

// Update a vehicle
export const updateVehicle = async (id: string, vehicle: Partial<Vehicle>, firestore: Firestore = db): Promise<void> => {
  try {
    const vehicleRef = doc(firestore, COLLECTION_NAME, id);
    await updateDoc(vehicleRef, vehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

// Delete a vehicle
export const deleteVehicle = async (id: string, firestore: Firestore = db): Promise<void> => {
  try {
    await deleteDoc(doc(firestore, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
};

// Get vehicles by type (excluding reserved ones)
export const getVehiclesByType = async (type: string): Promise<Vehicle[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('type', '==', type));
    const querySnapshot = await getDocs(q);
    const vehiclesByType = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Vehicle));

    // Get reserved vehicle IDs (vehicles with pending or active rentals)
    const rentalsQuery = query(
      collection(db, 'rentals'),
      where('status', 'in', ['pending', 'active'])
    );
    const rentalsSnapshot = await getDocs(rentalsQuery);
    const reservedVehicleIds = new Set(
      rentalsSnapshot.docs.map(doc => doc.data().vehicleId)
    );

    // Filter out reserved vehicles
    return vehiclesByType.filter(vehicle => !reservedVehicleIds.has(vehicle.id));
  } catch (error) {
    console.error('Error getting vehicles by type:', error);
    throw error;
  }
};

// Get top rented cars based on actual rental history (includes currently rented ones)
export const getTopRentedVehicles = async (): Promise<(Vehicle & { rentalCount: number; isCurrentlyRented: boolean })[]> => {
  try {
    console.log('🔥 Fetching all vehicles for top rented calculation...');
    // Get ALL vehicles (don't filter out reserved ones)
    const vehiclesSnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const allVehicles = vehiclesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Vehicle));

    console.log('🔥 Fetching all rentals for count calculation...');
    // Get ALL rentals to count how many times each vehicle has been rented
    const rentalsSnapshot = await getDocs(collection(db, 'rentals'));
    const allRentals = rentalsSnapshot.docs.map(doc => doc.data());

    // Count rentals for each vehicle
    const rentalCounts = new Map<string, number>();
    const currentlyRentedVehicleIds = new Set<string>();

    allRentals.forEach(rental => {
      const vehicleId = rental.vehicleId;
      if (vehicleId) {
        // Count all completed rentals for popularity
        if (rental.status === 'completed') {
          rentalCounts.set(vehicleId, (rentalCounts.get(vehicleId) || 0) + 1);
        }
        // Track currently rented vehicles
        if (rental.status === 'pending' || rental.status === 'active') {
          currentlyRentedVehicleIds.add(vehicleId);
        }
      }
    });

    // Combine vehicle data with rental counts
    const vehiclesWithCounts = allVehicles.map(vehicle => ({
      ...vehicle,
      rentalCount: rentalCounts.get(vehicle.id!) || 0,
      isCurrentlyRented: currentlyRentedVehicleIds.has(vehicle.id!)
    }));

    // Sort by rental count (descending) then by name
    const sortedVehicles = vehiclesWithCounts.sort((a, b) => {
      const byCount = b.rentalCount - a.rentalCount;
      if (byCount !== 0) return byCount;
      return a.name.localeCompare(b.name);
    });

    console.log('🔥 Top rented vehicles calculated:', sortedVehicles.slice(0, 3).map(v => ({
      name: v.name,
      rentalCount: v.rentalCount,
      isCurrentlyRented: v.isCurrentlyRented
    })));

    // Return top 3 with rental statistics
    return sortedVehicles.slice(0, 3);
  } catch (error) {
    console.error('🔥❌ Error getting top rented vehicles:', error);
    throw error;
  }
};
