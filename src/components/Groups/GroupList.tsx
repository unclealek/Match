import { useState, useEffect } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import CreateGroupModal from './CreateGroupModal';
import JoinGroupForm from './JoinGroupForm';
import GiftMatchSystem from './GiftMatchSystem';
import MemberList from './MemberList';
import { formatGroupCode, formatDate } from '../../utils/groupCode';
import { useNavigate } from 'react-router-dom';

interface Group {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  members: string[];
  occasion: string;
  groupCode: string;
  giftExchangeDate?: Date;
  budget?: string;
  maxMembers: number;
}

const MAX_MEMBERS = 20;

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { currentUser } = useAuth();
  const { getDocuments, updateDocument } = useFirestore('groups');
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, [currentUser]);

  async function loadGroups() {
    if (!currentUser) return;

    try {
      setLoading(true);
      const userGroups = await getDocuments([
        ['members', 'array-contains', currentUser.uid]
      ]);
      setGroups(userGroups as Group[]);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  }

  function copyGroupCode(code: string) {
    navigator.clipboard.writeText(formatGroupCode(code));
    toast.success('Group code copied to clipboard!');
  }

  async function leaveGroup(groupId: string) {
    if (!currentUser) return;
    
    // Don't allow admin to leave their own group
    const group = groups.find(g => g.id === groupId);
    if (group && group.createdBy === currentUser.uid) {
      toast.error("As the admin, you can't leave your own group. You can delete it instead.");
      return;
    }

    try {
      const groupRef = await getDocuments([['id', '==', groupId]]);
      const groupData = groupRef[0] as Group;
      const updatedMembers = groupData.members.filter(id => id !== currentUser.uid);
      await updateDocument(groupId, {
        members: updatedMembers
      });
      toast.success('Successfully left the group');
      loadGroups(); // Refresh groups list
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave group');
    }
  }

  function handleViewGroup(groupId: string) {
    navigate(`/groups/${groupId}`);
  }

  function handleDeleteGroup(groupId: string) {
    // Implement delete group logic here
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div
          key={group.id}
          className="bg-background-paper rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-text">
                  {group.name}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {group.description}
                </p>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="inline-flex items-center text-sm text-text-secondary">
                    <svg
                      className="mr-1.5 h-5 w-5 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    {group.members.length} members
                  </span>
                  <span className="inline-flex items-center text-sm text-text-secondary">
                    <svg
                      className="mr-1.5 h-5 w-5 text-secondary"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Created {formatDate(group.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewGroup(group.id)}
                  className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-hover active:bg-primary-active focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
                >
                  View Group
                </button>
                {currentUser?.uid === group.createdBy && (
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-text bg-secondary hover:bg-secondary-hover active:bg-secondary-active focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all duration-200"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-background-paper rounded-lg shadow-md p-6 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-secondary rounded w-1/4"></div>
                  <div className="mt-2 h-3 bg-secondary rounded w-3/4"></div>
                  <div className="mt-4 flex items-center space-x-4">
                    <div className="h-3 bg-secondary rounded w-1/6"></div>
                    <div className="h-3 bg-secondary rounded w-1/4"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-24 bg-primary rounded"></div>
                  <div className="h-8 w-20 bg-secondary rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && groups.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-text">No groups</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Get started by creating a new group
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-hover active:bg-primary-active focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              New Group
            </button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={loadGroups}
        />
      )}

      {showJoinModal && (
        <JoinGroupForm
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onGroupJoined={loadGroups}
        />
      )}
    </div>
  );
}
