import { collection, addDoc, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
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
  await addDoc(collection(db, 'contacts'), {
    ...message,
    createdAt: new Date().toISOString()
  });
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
export const deleteContactMessage = async (messageId: string): Promise<void> => {
  await deleteDoc(doc(db, 'contacts', messageId));
};
