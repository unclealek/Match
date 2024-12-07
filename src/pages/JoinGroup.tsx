import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFirestore } from '../hooks/useFirestore';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function JoinGroup() {
  const { currentUser } = useAuth();
  const { getDocuments, updateDocument } = useFirestore('groups');
  const navigate = useNavigate();
  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      const normalizedCode = groupCode.trim();

      if (!normalizedCode) {
        setError('Please enter a group code');
        return;
      }

      // Find group with code
      const groups = await getDocuments([
        ['groupCode', '==', normalizedCode]
      ]);

      if (groups.length === 0) {
        setError('Invalid group code. Please check and try again.');
        return;
      }

      const group = groups[0];

      // Check if user is already a member
      if (group.members.includes(currentUser.uid)) {
        setError('You are already a member of this group.');
        return;
      }

      // Check member limit
      if (group.members.length >= 20) {
        setError('This group has reached its maximum capacity of 20 members.');
        return;
      }

      // Add user to group members
      await updateDocument(group.id, {
        members: [...group.members, currentUser.uid]
      });

      toast.success('Successfully joined the group!');
      navigate('/groups');
    } catch (error) {
      console.error('Error joining group:', error);
      setError('Failed to join group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <h2 className="text-2xl font-bold mb-4">Join a Group</h2>
      <form onSubmit={handleJoinGroup} className="space-y-4">
        <input
          type="text"
          value={groupCode}
          onChange={(e) => setGroupCode(e.target.value)}
          placeholder="Enter group code"
          className="block w-full p-2 border border-gray-300 rounded-md"
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white p-2 rounded-md hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Join Group'}
        </button>
      </form>
    </div>
  );
}
