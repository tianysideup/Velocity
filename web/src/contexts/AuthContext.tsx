import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  type User,
  type UserCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface UserProfile {
  name: string;
  phone: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>; // Returns role
  signup: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<string | null> => {
    console.log('[AuthContext] Login called with email:', email);
    await signInWithEmailAndPassword(auth, email, password);
    console.log('[AuthContext] Firebase auth successful');
    
    // Get the user's role after login
    const user = auth.currentUser;
    console.log('[AuthContext] Current user:', user?.email, 'UID:', user?.uid);
    
    if (user) {
      try {
        console.log('[AuthContext] Fetching user document from Firestore...');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        console.log('[AuthContext] User document exists:', userDoc.exists());
        
        if (!userDoc.exists() && email === 'admin@velocity.com') {
          // Auto-create admin document if it doesn't exist
          console.log('[AuthContext] Creating admin user document...');
          await setDoc(doc(db, 'users', user.uid), {
            email: email,
            role: 'admin',
            createdAt: new Date()
          });
          console.log('[AuthContext] Admin user document created!');
          return 'admin';
        }
        
        const userData = userDoc.data();
        console.log('[AuthContext] User data:', userData);
        
        const role = userData?.role || 'user';
        console.log('[AuthContext] Returning role:', role);
        return role;
      } catch (error) {
        console.error('[AuthContext] Error fetching user role:', error);
        return null;
      }
    }
    console.log('[AuthContext] No current user found');
    return null;
  };

  const signup = async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Set up real-time listener for profile changes when user is authenticated
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    
    if (currentUser?.uid) {
      unsubscribeProfile = onSnapshot(
        doc(db, 'users', currentUser.uid),
        (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            const profile: UserProfile = {
              name: userData.name || '',
              phone: userData.phone || '',
              email: userData.email || currentUser?.email || '',
              role: userData.role || 'user',
            };
            setUserProfile(profile);
          }
        },
        (error) => {
          console.error('Error listening to profile changes:', error);
        }
      );
    }

    return () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, [currentUser]);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
