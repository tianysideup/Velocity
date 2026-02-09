import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * One-time function to create admin user document in Firestore
 * Run this once to set up the admin account
 */
export async function createAdminUserDocument() {
  const adminUID = 'Vj1p1kRUzXJpFfaDf77HZkV3k1'; // Your admin UID
  const adminEmail = 'admin@velocity.com';

  try {
    await setDoc(doc(db, 'users', adminUID), {
      email: adminEmail,
      role: 'admin',
      createdAt: new Date()
    });
    
    console.log('✅ Admin user document created successfully!');
    return { success: true, message: 'Admin user created!' };
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    return { success: false, message: 'Failed to create admin user', error };
  }
}
