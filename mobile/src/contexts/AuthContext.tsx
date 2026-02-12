import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface UserProfile {
  name: string;
  phone: string;
  email: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
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

  const signup = async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (currentUser) {
      try {
        await AsyncStorage.removeItem(`onboarding_${currentUser.uid}`);
      } catch (error) {
        console.error('Error clearing onboarding status:', error);
      }
    }
    await firebaseSignOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchUserProfile(user.uid);
      } else {
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
      try {
        unsubscribeProfile = onSnapshot(
          doc(db, 'users', currentUser.uid),
          (doc) => {
            if (doc.exists()) {
              const userData = doc.data();
              const profile: UserProfile = {
                name: userData.name || '',
                phone: userData.phone || '',
                email: userData.email || currentUser?.email || '',
              };
              setUserProfile(profile);
            }
          },
          (error) => {
            console.error('Error listening to profile changes:', error);
            // Don't fail silently - still allow app to function with cached/basic profile
          }
        );
      } catch (error) {
        console.error('Error setting up profile listener:', error);
      }
    }

    return () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, [currentUser]);

  const fetchUserProfile = async (uid: string) => {
    try {
      console.log('[Auth] Fetching user profile for:', uid);
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const profile: UserProfile = {
          name: userData.name || '',
          phone: userData.phone || '',
          email: userData.email || currentUser?.email || '',
        };
        setUserProfile(profile);
        console.log('[Auth] User profile loaded successfully');
        return profile;
      } else {
        console.log('[Auth] User document does not exist');
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      // Don't block auth flow if profile fetch fails
      // User can still use the app with just email from auth
      if (currentUser?.email) {
        const fallbackProfile: UserProfile = {
          name: currentUser.email.split('@')[0],
          phone: '',
          email: currentUser.email,
        };
        setUserProfile(fallbackProfile);
      }
    }
    return null;
  };

  const refreshProfile = async () => {
    if (currentUser?.uid) {
      await fetchUserProfile(currentUser.uid);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!currentUser?.uid) return;
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), profileData);
      
      // Update local state immediately for real-time UI updates
      setUserProfile(prev => prev ? { ...prev, ...profileData } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
          <Text style={{ fontSize: 42, fontWeight: 'bold', color: '#000000', letterSpacing: 2 }}>VELOCITY</Text>
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
