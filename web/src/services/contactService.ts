import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'replied';
  reply?: string;
  createdAt: string;
  repliedAt?: string;
}

// Submit a new contact message
export const submitContactMessage = async (message: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>): Promise<void> => {
  await addDoc(collection(db, 'contacts'), {
    ...message,
    status: 'pending',
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

// Get pending messages
export const getPendingMessages = async (): Promise<ContactMessage[]> => {
  const q = query(
    collection(db, 'contacts'),
    where('status', '==', 'pending')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ContactMessage));
};

// Reply to a contact message
export const replyToMessage = async (messageId: string, reply: string): Promise<void> => {
  const messageRef = doc(db, 'contacts', messageId);
  await updateDoc(messageRef, {
    status: 'replied',
    reply,
    repliedAt: new Date().toISOString()
  });
};

// Delete a contact message
export const deleteContactMessage = async (messageId: string): Promise<void> => {
  await deleteDoc(doc(db, 'contacts', messageId));
};
