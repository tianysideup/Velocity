import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Testimonial {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
}

// Get all approved testimonials
export const getApprovedTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const q = query(
      collection(db, 'testimonials'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Testimonial));
  } catch (error) {
    // If orderBy fails (missing index), try without ordering
    console.warn('Failed to query with orderBy, trying without ordering:', error);
    const q = query(
      collection(db, 'testimonials'),
      where('status', '==', 'approved')
    );
    const querySnapshot = await getDocs(q);
    const testimonials = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Testimonial));
    
    // Sort in memory by approvedAt or createdAt
    return testimonials.sort((a, b) => {
      const dateA = new Date(a.approvedAt || a.createdAt).getTime();
      const dateB = new Date(b.approvedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
  }
};

// Get all testimonials (for admin)
export const getAllTestimonials = async (): Promise<Testimonial[]> => {
  const q = query(
    collection(db, 'testimonials'),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Testimonial));
};

// Get user's testimonials
export const getUserTestimonials = async (userId: string): Promise<Testimonial[]> => {
  const q = query(
    collection(db, 'testimonials'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Testimonial));
};

// Submit a new testimonial
export const submitTestimonial = async (testimonial: Omit<Testimonial, 'id'>): Promise<void> => {
  await addDoc(collection(db, 'testimonials'), testimonial);
};

// Update testimonial status (admin only)
export const updateTestimonialStatus = async (
  testimonialId: string, 
  status: 'approved' | 'rejected'
): Promise<void> => {
  const testimonialRef = doc(db, 'testimonials', testimonialId);
  const updateData: any = { status };
  
  if (status === 'approved') {
    updateData.approvedAt = new Date().toISOString();
  }
  
  await updateDoc(testimonialRef, updateData);
};

// Delete testimonial (admin only)
export const deleteTestimonial = async (testimonialId: string): Promise<void> => {
  await deleteDoc(doc(db, 'testimonials', testimonialId));
};
