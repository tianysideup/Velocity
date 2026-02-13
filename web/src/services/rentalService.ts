import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  type Firestore 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Rental {
  id?: string;
  confirmationNumber: string;
  vehicleId: string;
  userId: string;
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
  totalAmount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

const rentalsCollection = 'rentals';

export const getAllRentals = async (firestore: Firestore = db): Promise<Rental[]> => {
  try {
    const q = query(collection(firestore, rentalsCollection), orderBy('createdAt', 'desc'));
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

export const deleteRental = async (id: string, firestore: Firestore = db): Promise<void> => {
  try {
    await deleteDoc(doc(firestore, rentalsCollection, id));
  } catch (error) {
    console.error('Error deleting rental:', error);
    throw error;
  }
};

export const updateRentalStatus = async (id: string, status: Rental['status'], firestore: Firestore = db): Promise<void> => {
  try {
    const rentalRef = doc(firestore, rentalsCollection, id);
    await updateDoc(rentalRef, { status });
  } catch (error) {
    console.error('Error updating rental status:', error);
    throw error;
  }
};

// Get all rentals for a specific user
export const getUserRentals = async (userId: string): Promise<Rental[]> => {
  try {
    const q = query(
      collection(db, rentalsCollection),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
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
    console.error('Error getting user rentals:', error);
    throw error;
  }
};

// Subscribe to user rentals for real-time updates
export const subscribeToUserRentals = (
  userId: string,
  callback: (rentals: Rental[]) => void
): (() => void) => {
  const q = query(
    collection(db, rentalsCollection),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const rentals = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      } as Rental;
    });
    callback(rentals);
  }, (error) => {
    console.error('Error subscribing to user rentals:', error);
    
    // If index is missing, try without orderBy as fallback
    if (error.code === 'failed-precondition' || error.message.includes('index')) {
      console.log('Retrying query without orderBy...');
      const fallbackQuery = query(
        collection(db, rentalsCollection),
        where('userId', '==', userId)
      );
      
      return onSnapshot(fallbackQuery, (snapshot) => {
        const rentals = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
          } as Rental;
        }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        callback(rentals);
      });
    }
  });
};
