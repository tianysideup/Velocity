import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { adminAuth, adminDb } from '../config/firebase';

interface AdminProfile {
  email: string;
  role: string;
  uid: string;
}

interface AdminAuthContextType {
  adminUser: User | null;
  adminProfile: AdminProfile | null;
  loading: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    console.log('[AdminAuthContext] Admin login called with email:', email);
    
    try {
      const userCredential = await signInWithEmailAndPassword(adminAuth, email, password);
      const user = userCredential.user;
      
      console.log('[AdminAuthContext] Firebase auth successful');
      
      // Get the user's role — use adminDb so Firestore sends the admin auth token
      const userDoc = await getDoc(doc(adminDb, 'users', user.uid));
      console.log('[AdminAuthContext] User document exists:', userDoc.exists());
      
      if (!userDoc.exists() && email === 'admin@velocity.com') {
        // Auto-create admin document if it doesn't exist
        console.log('[AdminAuthContext] Creating admin user document...');
        await setDoc(doc(adminDb, 'users', user.uid), {
          email: email,
          role: 'admin',
          createdAt: new Date()
        });
        console.log('[AdminAuthContext] Admin user document created!');
        
        // Set admin state and store in sessionStorage
        setAdminUser(user);
        setAdminProfile({
          email: email,
          role: 'admin',
          uid: user.uid
        });
        sessionStorage.setItem('adminLoggedIn', 'true');
        
        return true;
      }
      
      const userData = userDoc.data();
      console.log('[AdminAuthContext] User data:', userData);
      
      const role = userData?.role || 'user';
      console.log('[AdminAuthContext] User role:', role);
      
      // Only allow admin role
      if (role !== 'admin') {
        console.log('[AdminAuthContext] Not an admin, signing out');
        sessionStorage.removeItem('adminLoggedIn');
        await signOut(adminAuth);
        return false;
      }
      
      // Set admin state and store in sessionStorage
      setAdminUser(user);
      setAdminProfile({
        email: userData?.email || user.email || '',
        role: userData?.role || 'admin',
        uid: user.uid
      });
      sessionStorage.setItem('adminLoggedIn', 'true');
      
      return true;
    } catch (error) {
      console.error('[AdminAuthContext] Login error:', error);
      throw error;
    }
  };

  const adminLogout = async () => {
    console.log('[AdminAuthContext] Admin logout called');
    sessionStorage.removeItem('adminLoggedIn');
    setAdminUser(null);
    setAdminProfile(null);
    await signOut(adminAuth);
  };

  useEffect(() => {
    console.log('[AdminAuthContext] Setting up onAuthStateChanged listener');
    
    const unsubscribe = onAuthStateChanged(adminAuth, async (user) => {
      console.log('[AdminAuthContext] Auth state changed, user:', user?.email);
      const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
      
      if (user && isAdminLoggedIn) {
        try {
          // Verify admin role
          const userDoc = await getDoc(doc(adminDb, 'users', user.uid));
          const userData = userDoc.data();
          
          if (userData?.role === 'admin') {
            console.log('[AdminAuthContext] Admin session restored for:', user.email);
            setAdminUser(user);
            setAdminProfile({
              email: userData.email || user.email || '',
              role: userData.role,
              uid: user.uid
            });
          } else {
            // Role doesn't match, clear session
            console.log('[AdminAuthContext] User is not admin, clearing session');
            sessionStorage.removeItem('adminLoggedIn');
            setAdminUser(null);
            setAdminProfile(null);
          }
        } catch (error) {
          console.error('[AdminAuthContext] Error verifying admin session:', error);
          sessionStorage.removeItem('adminLoggedIn');
          setAdminUser(null);
          setAdminProfile(null);
        }
      } else if (!user) {
        console.log('[AdminAuthContext] No user, clearing admin state');
        sessionStorage.removeItem('adminLoggedIn');
        setAdminUser(null);
        setAdminProfile(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const value = {
    adminUser,
    adminProfile,
    loading,
    adminLogin,
    adminLogout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
