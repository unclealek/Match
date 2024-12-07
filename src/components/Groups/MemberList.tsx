import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface MemberListProps {
  members: string[];
  isAdmin: boolean;
}

interface UserProfile {
  id: string;
  displayName: string;
  photoURL?: string;
  email: string;
}

export default function MemberList({ members, isAdmin }: MemberListProps) {
  const [memberProfiles, setMemberProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const loadUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Loading profile for user:', userId);
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.warn(`No profile found for user ${userId}`);
        return null;
      }

      const userData = userSnap.data();
      console.log('Loaded user data:', userData);

      const userProfile: UserProfile = {
        id: userId,
        displayName: userData.displayName || 'Unknown User',
        photoURL: userData.photoURL || '',
        email: userData.email || '',
      };

      return userProfile;
    } catch (error) {
      console.error(`Error loading profile for user ${userId}:`, error);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadProfiles = async () => {
      if (!members.length) return;

      setLoading(true);
      try {
        const loadedProfiles = await Promise.all(
          members.map(async (memberId) => {
            return await loadUserProfile(memberId);
          })
        );

        if (mounted) {
          // Filter out null profiles and update state
          const validProfiles = loadedProfiles.filter((profile): profile is UserProfile => profile !== null);
          console.log('Setting member profiles:', validProfiles);
          setMemberProfiles(validProfiles);
        }
      } catch (error) {
        console.error('Error loading member profiles:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfiles();

    return () => {
      mounted = false;
    };
  }, [members, loadUserProfile]);

  if (loading && memberProfiles.length === 0) {
    return (
      <div className="space-y-2">
        {members.map((memberId) => (
          <div key={memberId} className="animate-pulse flex items-center space-x-4">
            <div className="h-10 w-10 bg-secondary rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-secondary rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!loading && memberProfiles.length === 0) {
    return (
      <div className="text-sm text-text-secondary text-center py-2">
        No members found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {memberProfiles.map((profile) => (
        <div
          key={profile.id}
          className="flex items-center space-x-4 p-3 rounded-lg bg-background-paper hover:bg-secondary/10 transition-all duration-200"
        >
          {profile.photoURL ? (
            <img
              src={profile.photoURL}
              alt={profile.displayName}
              className="h-10 w-10 rounded-full object-cover border-2 border-primary"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-medium text-lg">
                {profile.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-text">{profile.displayName}</p>
              {profile.id === currentUser?.uid && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                  You
                </span>
              )}
              {isAdmin && profile.id === members[0] && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-text">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
