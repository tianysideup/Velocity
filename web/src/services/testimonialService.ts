import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
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
  try {
    const q = query(
      collection(db, 'testimonials'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Testimonial));
  } catch (error) {
    // If orderBy fails (missing index or field), try without ordering
    console.warn('Failed to query with orderBy, trying without ordering:', error);
    const querySnapshot = await getDocs(collection(db, 'testimonials'));
    const testimonials = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Testimonial));
    
    // Sort in memory by createdAt
    return testimonials.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }
};

// Get user's testimonials
export const getUserTestimonials = async (userId: string): Promise<Testimonial[]> => {
  try {
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
  } catch (error) {
    // If orderBy fails (missing index), try without ordering
    console.warn('Failed to query with orderBy, trying without ordering:', error);
    const q = query(
      collection(db, 'testimonials'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const testimonials = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Testimonial));
    
    // Sort in memory by createdAt
    return testimonials.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }
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
  if (!testimonialId) {
    throw new Error('Testimonial ID is required');
  }
  
  console.log('Updating testimonial status:', testimonialId, 'to', status);
  
  try {
    const testimonialRef = doc(db, 'testimonials', testimonialId);
    const updateData: any = { status };
    
    if (status === 'approved') {
      updateData.approvedAt = new Date().toISOString();
    }
    
    await updateDoc(testimonialRef, updateData);
    console.log('Testimonial status updated successfully');
  } catch (error) {
    console.error('Error updating testimonial status:', error);
    throw error;
  }
};

// Delete testimonial (admin only)
export const deleteTestimonial = async (testimonialId: string): Promise<void> => {
  if (!testimonialId) {
    throw new Error('Testimonial ID is required');
  }
  
  console.log('Deleting testimonial:', testimonialId);
  
  try {
    await deleteDoc(doc(db, 'testimonials', testimonialId));
    console.log('Testimonial deleted successfully');
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    throw error;
  }
};

// Real-time listener for all testimonials (admin only)
export const subscribeToTestimonials = (callback: (testimonials: Testimonial[]) => void): (() => void) => {
  try {
    // Try with orderBy first
    const q = query(
      collection(db, 'testimonials'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, 
      (querySnapshot) => {
        const testimonials = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Testimonial));
        callback(testimonials);
      },
      (error) => {
        console.warn('Failed to listen with orderBy, trying without ordering:', error);
        // If orderBy fails, set up listener without ordering
        const simpleQuery = collection(db, 'testimonials');
        return onSnapshot(simpleQuery, (querySnapshot) => {
          const testimonials = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Testimonial));
          
          // Sort in memory by createdAt
          const sorted = testimonials.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          
          callback(sorted);
        });
      }
    );
  } catch (error) {
    console.error('Error setting up testimonial listener:', error);
    // Fallback to simple listener
    return onSnapshot(collection(db, 'testimonials'), (querySnapshot) => {
      const testimonials = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Testimonial));
      
      const sorted = testimonials.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      callback(sorted);
    });
  }
};
