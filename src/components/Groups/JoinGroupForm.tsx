import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestore } from '../../hooks/useFirestore';
import { normalizeGroupCode, formatGroupCode } from '../../utils/groupCode';
import { toast } from 'react-hot-toast';

const MAX_MEMBERS = 20;

export default function JoinGroupForm() {
  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { getDocuments, updateDocument } = useFirestore('groups');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      const normalizedCode = normalizeGroupCode(groupCode);
      
      // Find group with code
      const groups = await getDocuments([
        ['groupCode', '==', normalizedCode]
      ]);

      if (groups.length === 0) {
        toast.error('Invalid group code. Please check and try again.');
        return;
      }

      const group = groups[0];

      // Check if user is already a member
      if (group.members.includes(currentUser.uid)) {
        toast.error('You are already a member of this group.');
        return;
      }

      // Check member limit
      if (group.members.length >= MAX_MEMBERS) {
        toast.error('This group has reached its maximum capacity of 20 members.');
        return;
      }

      // Add user to group members
      await updateDocument(group.id, {
        members: [...group.members, currentUser.uid]
      });

      toast.success('Successfully joined the group!');
      setGroupCode('');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Join a Group
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Enter the group code shared with you to join a gift exchange group. Groups are limited to 20 members.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 sm:flex sm:items-center">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="groupCode" className="sr-only">
              Group Code
            </label>
            <input
              type="text"
              name="groupCode"
              id="groupCode"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Enter code (e.g., ABC-123)"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Group'}
          </button>
        </form>
      </div>
    </div>
  );
}
