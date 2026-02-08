import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Rental {
  id?: string;
  confirmationNumber: string;
  vehicleName: string;
  vehicleType: string;
  vehicleImage: string;
  dailyRate: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  returnDate: string;
  numberOfDays: number;
  subtotal: number;
  deposit: number;
  totalAmount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

const rentalsCollection = 'rentals';

export const getAllRentals = async (): Promise<Rental[]> => {
  try {
    const q = query(collection(db, rentalsCollection), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      } as Rental;
    });
  } catch (error) {
    console.error('Error getting rentals:', error);
    throw error;
  }
};

export const addRental = async (rental: Omit<Rental, 'id'>): Promise<void> => {
  try {
    await addDoc(collection(db, rentalsCollection), {
      ...rental,
      createdAt: Timestamp.fromDate(rental.createdAt)
    });
  } catch (error) {
    console.error('Error adding rental:', error);
    throw error;
  }
};

export const updateRental = async (id: string, rental: Partial<Rental>): Promise<void> => {
  try {
    const rentalRef = doc(db, rentalsCollection, id);
    const updateData = { ...rental };
    if (rental.createdAt) {
      updateData.createdAt = Timestamp.fromDate(rental.createdAt) as any;
    }
    await updateDoc(rentalRef, updateData);
  } catch (error) {
    console.error('Error updating rental:', error);
    throw error;
  }
};

export const deleteRental = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, rentalsCollection, id));
  } catch (error) {
    console.error('Error deleting rental:', error);
    throw error;
  }
};

export const updateRentalStatus = async (id: string, status: Rental['status']): Promise<void> => {
  try {
    const rentalRef = doc(db, rentalsCollection, id);
    await updateDoc(rentalRef, { status });
  } catch (error) {
    console.error('Error updating rental status:', error);
    throw error;
  }
};
