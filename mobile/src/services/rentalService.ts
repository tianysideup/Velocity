import { collection, addDoc, query, where, getDocs, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Rental {
  id?: string;
  confirmationNumber: string;
  vehicleId: string;
  vehicleName: string;
  vehicleImage: string;
  vehicleType: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  licensePhoto: string;
  pickupDate: string;
  returnDate: string;
  numberOfDays: number;
  dailyRate: number;
  subtotal: number;
  totalAmount: number;
  status: 'pending' | 'active' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'rentals';

// Generate confirmation number
const generateConfirmationNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `VR${timestamp.slice(-8)}${random}`;
};

// Create a new rental
export const createRental = async (reservationData: any): Promise<string> => {
  try {
    const confirmationNumber = reservationData.confirmationNumber || generateConfirmationNumber();
    
    const rentalData = {
      confirmationNumber,
      vehicleId: reservationData.vehicleId,
      vehicleName: reservationData.vehicle?.name || 'Unknown Vehicle',
      vehicleImage: reservationData.vehicle?.image || '',
      vehicleType: reservationData.vehicle?.type || 'Vehicle',
      userId: reservationData.userId,
      customerName: reservationData.fullName,
      customerEmail: reservationData.email,
      customerPhone: reservationData.phone,
      licensePhoto: reservationData.licensePhoto || '',
      pickupDate: reservationData.pickupDate instanceof Date 
        ? reservationData.pickupDate.toISOString().split('T')[0]
        : reservationData.pickupDate,
      returnDate: reservationData.returnDate instanceof Date 
        ? reservationData.returnDate.toISOString().split('T')[0]
        : reservationData.returnDate,
      numberOfDays: reservationData.numberOfDays,
      dailyRate: reservationData.vehicle?.price || 0,
      subtotal: reservationData.totalAmount,
      totalAmount: reservationData.totalAmount,
      status: 'pending',
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };

    // Add to Firebase collection
    const docRef = await addDoc(collection(db, COLLECTION_NAME), rentalData);

    console.log('Rental created with ID:', docRef.id);
    return confirmationNumber;
  } catch (error) {
    console.error('Error creating rental:', error);
    throw error;
  }
};

// Get all rentals for a user
export const getUserRentals = async (userId: string): Promise<Rental[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
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
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const rentals = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Rental;
    });
    callback(rentals);
  }, (error) => {
    console.error('Error subscribing to user rentals:', error);
    
    // If index is missing, try without orderBy as fallback
    if (error.code === 'failed-precondition' || error.message.includes('index')) {
      console.log('Retrying query without orderBy...');
      const fallbackQuery = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId)
      );
      
      return onSnapshot(fallbackQuery, (snapshot) => {
        const rentals = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Rental;
        }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        callback(rentals);
      });
    }
  });
};