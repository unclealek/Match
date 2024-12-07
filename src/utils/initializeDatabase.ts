import { db } from '../config/firebase';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

export interface UserProfile {
  id: string;
  displayName: string;
  photoURL?: string;
  email: string;
  bio?: string;
  hobbies?: string[];
  activities?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export async function initializeUserProfile(user: User, displayName: string): Promise<void> {
  try {
    console.log('Initializing user profile with displayName:', displayName);
    const userRef = doc(db, 'users', user.uid);
    
    const userData: UserProfile = {
      id: user.uid,
      displayName: displayName || 'User',
      email: user.email || '',
      photoURL: user.photoURL || '',
      bio: '',
      hobbies: [],
      activities: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Set the initial profile data
    await setDoc(userRef, userData);
    console.log('User profile initialized:', userData);

    // Update the profile if displayName was provided
    if (displayName && displayName !== 'User') {
      await updateDoc(userRef, {
        displayName: displayName,
        updatedAt: new Date()
      });
      console.log('Updated displayName to:', displayName);
    }
  } catch (error) {
    console.error('Error initializing user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    console.log('Updating user profile:', updates);
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    });
    console.log('Profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}
