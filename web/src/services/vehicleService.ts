import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
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

// Get all vehicles
export const getAllVehicles = async (): Promise<Vehicle[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Vehicle));
  } catch (error) {
    console.error('Error getting vehicles:', error);
    throw error;
  }
};

// Add a new vehicle
export const addVehicle = async (vehicle: Omit<Vehicle, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), vehicle);
    return docRef.id;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    throw error;
  }
};

// Update a vehicle
export const updateVehicle = async (id: string, vehicle: Partial<Vehicle>): Promise<void> => {
  try {
    const vehicleRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(vehicleRef, vehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

// Delete a vehicle
export const deleteVehicle = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
};

// Get vehicles by type
export const getVehiclesByType = async (type: string): Promise<Vehicle[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('type', '==', type));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Vehicle));
  } catch (error) {
    console.error('Error getting vehicles by type:', error);
    throw error;
  }
};
