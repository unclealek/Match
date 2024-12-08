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
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium">Join a Group</h2>
      <div className="mt-4">
        <label htmlFor="groupCode" className="block text-sm font-medium text-text-secondary">Group Code</label>
        <input
          type="text"
          id="groupCode"
          value={groupCode}
          onChange={(e) => setGroupCode(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-primary focus:border-primary"
          placeholder="Enter code (e.g., ABC-123)"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 bg-primary text-text hover:bg-primary-hover active:bg-primary-active px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
      >
        {loading ? 'Joining...' : 'Join Group'}
      </button>
    </form>
  );
}
