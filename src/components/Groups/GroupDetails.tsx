import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestore } from '../../hooks/useFirestore';
import MemberList from './MemberList';
import { formatDate } from '../../utils/groupCode';
import GiftMatchSystem from './GiftMatchSystem';

interface Group {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: number;
  members: string[];
  groupCode: string;
  matches?: { [key: string]: string };
}

interface UserProfile {
  id: string;
  displayName: string;
}

export default function GroupDetails() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getDocument, updateDocument } = useFirestore('groups');
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchingInProgress, setMatchingInProgress] = useState(false);
  const [memberProfiles, setMemberProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    async function loadGroup() {
      if (!groupId || !currentUser) return;

      try {
        const groupData = await getDocument(groupId);
        if (!groupData) {
          toast.error('Group not found');
          navigate('/groups');
          return;
        }

        // Check if user is a member
        if (!groupData.members.includes(currentUser.uid)) {
          toast.error('You do not have access to this group');
          navigate('/groups');
          return;
        }

        setGroup(groupData as Group);

        // Load member profiles
        const profiles = await Promise.all(groupData.members.map(loadUserProfile));
        setMemberProfiles(profiles.filter(profile => profile !== null) as UserProfile[]);
      } catch (error) {
        console.error('Error loading group:', error);
        toast.error('Failed to load group details');
        navigate('/groups');
      } finally {
        setLoading(false);
      }
    }

    loadGroup();
  }, [groupId, currentUser, getDocument, navigate]);

  const handleMatch = async () => {
    if (!group || !currentUser || currentUser.uid !== group.createdBy) return;

    try {
      setMatchingInProgress(true);
      const matches = await GiftMatchSystem.generateMatches(group.members);
      await updateDocument(group.id, { matches });
      setGroup(prev => prev ? { ...prev, matches } : null);
      toast.success('Gift exchange matches generated successfully!');
    } catch (error) {
      console.error('Error generating matches:', error);
      toast.error('Failed to generate matches');
    } finally {
      setMatchingInProgress(false);
    }
  };

  const isAdmin = currentUser?.uid === group?.createdBy;
  const hasMatches = group?.matches && Object.keys(group.matches).length > 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text">{group.name}</h1>
        <div className="flex space-x-4">
          {isAdmin && !hasMatches && (
            <button
              onClick={handleMatch}
              disabled={matchingInProgress || group.members.length < 2}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {matchingInProgress ? 'Generating Matches...' : 'Generate Gift Exchange Matches'}
            </button>
          )}
          <button
            onClick={() => navigate('/groups')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Back to Groups
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-text">Description</h3>
              <p className="mt-1 text-sm text-text-secondary">
                {group.description}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-text">Group Details</h3>
              <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-text-secondary">Created</dt>
                  <dd className="mt-1 text-sm text-text">
                    {formatDate(group.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-text-secondary">Members</dt>
                  <dd className="mt-1 text-sm text-text">
                    {group.members.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-text-secondary">Group Code</dt>
                  <dd className="mt-1 text-sm text-text font-mono">
                    {group.groupCode}
                  </dd>
                </div>
                {hasMatches && (
                  <div>
                    <dt className="text-sm font-medium text-text-secondary">Your Gift Recipient</dt>
                    <dd className="mt-1 text-sm text-text">
                      {currentUser && group.matches[currentUser.uid] ? (
                        <span className="font-medium text-primary">
                          Your gift recipient is: {
                          group.matches[currentUser.uid]
                          } 
                        </span>
                      ) : (
                        <span className="text-text-secondary">
                          No match assigned yet
                        </span>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-text">Members</h3>
              <div className="mt-2">
                <MemberList 
                  members={group.members} 
                  isAdmin={currentUser?.uid === group.createdBy} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Assuming loadUserProfile function is defined elsewhere
async function loadUserProfile(userId: string): Promise<UserProfile | null> {
  // Implementation to load user profile
}
