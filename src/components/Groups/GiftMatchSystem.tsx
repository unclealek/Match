import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestore } from '../../hooks/useFirestore';
import { toast } from 'react-hot-toast';
import { Timestamp } from 'firebase/firestore';
import { notificationService } from '../../services/NotificationService';
import { UserProfile, MatchData } from '../../types';

interface GiftMatchSystemProps {
  groupId: string;
  isAdmin: boolean;
  members: string[];
}

export default function GiftMatchSystem({ groupId, members }: GiftMatchSystemProps) {
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [matchProfile, setMatchProfile] = useState<UserProfile | null>(null);
  const [isMatched, setIsMatched] = useState(false);
  const { currentUser } = useAuth();
  const { getDocument, updateDocument } = useFirestore('groups');
  const userFirestore = useFirestore('users');

  useEffect(() => {
    if (currentUser) {
      initializeNotifications();
    }
  }, [currentUser]);

  useEffect(() => {
    if (groupId) {
      fetchMatchData();
    }
  }, [groupId]);

  useEffect(() => {
    if (matchData && currentUser) {
      checkIfMatched();
      if (isMatched) {
        fetchMatchProfile();
      }
    }
  }, [matchData, currentUser, isMatched]);

  const initializeNotifications = async () => {
    if (!currentUser) return;
    
    try {
      await notificationService.requestPermission(currentUser.uid);
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const fetchMatchData = async () => {
    try {
      const groupDoc = await getDocument(groupId);
      if (groupDoc) {
        setMatchData(groupDoc.matchData || null);
      }
    } catch (error) {
      console.error('Error fetching match data:', error);
      toast.error('Failed to fetch match data');
    }
  };

  const checkIfMatched = () => {
    if (!matchData || !currentUser) return;
    setIsMatched(matchData.matchedUsers.includes(currentUser.uid));
  };

  const fetchMatchProfile = async () => {
    if (!matchData || !currentUser) return;
    
    try {
      const matchId = matchData.matches[currentUser.uid];
      if (matchId) {
        const userDoc = await userFirestore.getDocument(matchId);
        if (userDoc) {
          setMatchProfile(userDoc as UserProfile);
        }
      }
    } catch (error) {
      console.error('Error fetching match profile:', error);
      toast.error('Failed to fetch match profile');
    }
  };

  const handleMatch = async () => {
    if (!currentUser || loading || isMatched) return;

    setLoading(true);
    try {
      // Get available members (not matched yet)
      const availableMembers = members.filter(
        memberId => !matchData?.matchedUsers.includes(memberId) && memberId !== currentUser.uid
      );

      if (availableMembers.length === 0) {
        toast.error('No available members to match with');
        return;
      }

      // Randomly select a match
      const randomIndex = Math.floor(Math.random() * availableMembers.length);
      const matchedUserId = availableMembers[randomIndex];

      // Create or update match data
      const newMatchData: MatchData = {
        matches: {
          ...matchData?.matches,
          [currentUser.uid]: matchedUserId,
          [matchedUserId]: currentUser.uid
        },
        matchedUsers: [
          ...(matchData?.matchedUsers || []),
          currentUser.uid,
          matchedUserId
        ],
        createdAt: Timestamp.now(),
        createdBy: currentUser.uid
      };

      // Update the group document
      await updateDocument(groupId, { matchData: newMatchData });
      setMatchData(newMatchData);
      toast.success('Successfully matched!');
      
      // Fetch the match profile
      const matchUserDoc = await userFirestore.getDocument(matchedUserId);
      if (matchUserDoc) {
        setMatchProfile(matchUserDoc as UserProfile);
      }
    } catch (error) {
      console.error('Error creating match:', error);
      toast.error('Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Gift Match System</h2>
      
      {isMatched && matchProfile ? (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Your Match</h3>
          <div className="bg-gray-50 p-4 rounded">
            <div className="flex items-center mb-2">
              {matchProfile.photoURL && (
                <img
                  src={matchProfile.photoURL}
                  alt={matchProfile.displayName}
                  className="w-12 h-12 rounded-full mr-3"
                />
              )}
              <div>
                <p className="font-semibold">{matchProfile.displayName}</p>
                <p className="text-gray-600">{matchProfile.bio}</p>
              </div>
            </div>
            {matchProfile.hobbies && matchProfile.hobbies.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">Hobbies:</p>
                <p>{matchProfile.hobbies.join(', ')}</p>
              </div>
            )}
            {matchProfile.activities && matchProfile.activities.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">Activities:</p>
                <p>{matchProfile.activities.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={handleMatch}
          disabled={loading || isMatched}
          className={`w-full py-2 px-4 rounded ${
            loading || isMatched
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Finding Match...' : isMatched ? 'Already Matched' : 'Find Match'}
        </button>
      )}
    </div>
  );
}
