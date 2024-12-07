import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { initializeUserProfile, updateUserProfile } from '../utils/initializeDatabase';

interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function createUserProfile(user: User, displayName: string) {
    try {
      console.log('Creating user profile with displayName:', displayName);
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await initializeUserProfile(user, displayName);
        // Update Firebase Auth profile
        await updateProfile(user, { 
          displayName: displayName,
          photoURL: user.photoURL || ''
        });
        console.log('User profile created successfully');
      } else {
        // Update existing profile if displayName is different
        const userData = userSnap.data();
        if (userData.displayName !== displayName) {
          await updateUserProfile(user.uid, { displayName });
          await updateProfile(user, { displayName });
          console.log('Updated existing profile with new displayName');
        }
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      throw error;
    }
  }

  async function signup(email: string, password: string, displayName: string) {
    try {
      console.log('Starting signup process for:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created in Firebase Auth');
      
      await createUserProfile(userCredential.user, displayName);
      console.log('Signup process completed successfully');
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('Auth state changed - user:', user.displayName);
        // Check and create profile if it doesn't exist
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await createUserProfile(user, user.displayName || 'User');
        }
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
