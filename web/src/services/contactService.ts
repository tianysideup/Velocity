import { collection, addDoc, getDocs, doc, deleteDoc, query, orderBy, onSnapshot, type Firestore } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

// Submit a new contact message
export const submitContactMessage = async (message: Omit<ContactMessage, 'id' | 'createdAt'>): Promise<void> => {
  try {
    console.log('Submitting contact message:', message);
    await addDoc(collection(db, 'contacts'), {
      ...message,
      createdAt: new Date().toISOString()
    });
    console.log('Contact message submitted successfully');
  } catch (error) {
    console.error('Error submitting contact message:', error);
    throw error;
  }
};

// Get all contact messages (admin only)
export const getAllContactMessages = async (): Promise<ContactMessage[]> => {
  try {
    const q = query(
      collection(db, 'contacts'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ContactMessage));
  } catch (error) {
    // If orderBy fails, try without ordering
    console.warn('Failed to query with orderBy, trying without ordering:', error);
    const querySnapshot = await getDocs(collection(db, 'contacts'));
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ContactMessage));
    
    // Sort in memory
    return messages.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }
};

// Delete a contact message
export const deleteContactMessage = async (messageId: string, firestore: Firestore = db): Promise<void> => {
  if (!messageId) {
    throw new Error('Message ID is required');
  }
  
  console.log('Deleting contact message:', messageId);
  
  try {
    await deleteDoc(doc(firestore, 'contacts', messageId));
    console.log('Contact message deleted successfully');
  } catch (error) {
    console.error('Error deleting contact message:', error);
    throw error;
  }
};

// Real-time listener for contact messages (admin only)
export const subscribeToContactMessages = (callback: (messages: ContactMessage[]) => void, firestore: Firestore = db): (() => void) => {
  try {
    const q = query(
      collection(firestore, 'contacts'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q,
      (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ContactMessage));
        callback(messages);
      },
      (error) => {
        console.warn('Failed to listen with orderBy, trying without ordering:', error);
        return onSnapshot(collection(firestore, 'contacts'), (querySnapshot) => {
          const messages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as ContactMessage));
          
          const sorted = messages.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });
          
          callback(sorted);
        });
      }
    );
  } catch (error) {
    console.error('Error setting up contact listener:', error);
    return onSnapshot(collection(firestore, 'contacts'), (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ContactMessage));
      
      const sorted = messages.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      callback(sorted);
    });
  }
};
