import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestore } from '../../hooks/useFirestore';
import { generateGroupCode, formatGroupCode } from '../../utils/groupCode';
import { toast } from 'react-hot-toast';
import { Timestamp } from 'firebase/firestore';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
}

const MAX_MEMBERS = 20;

export default function CreateGroupModal({
  isOpen,
  onClose,
  onGroupCreated
}: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [giftExchangeDate, setGiftExchangeDate] = useState('');
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();
  const { addDocument, getDocuments } = useFirestore('groups');

  const occasions = [
    'Christmas',
    'Birthday',
    'Wedding',
    'Baby Shower',
    'Anniversary',
    'Graduation',
    'Other'
  ];

  const budgetRanges = [
    'Under $25',
    '$25-$50',
    '$50-$100',
    '$100-$250',
    '$250-$500',
    '$500+'
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) {
      toast.error('You must be signed in to create a group');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (!occasion) {
      toast.error('Please select an occasion');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting group creation process...');
      
      // Generate a unique group code
      let isUnique = false;
      let groupCode = '';
      let attempts = 0;
      const maxAttempts = 5;
      
      while (!isUnique && attempts < maxAttempts) {
        groupCode = generateGroupCode();
        console.log('Generated group code:', groupCode);
        // Check if code already exists
        const existingGroups = await getDocuments([
          ['groupCode', '==', groupCode]
        ]);
        if (existingGroups.length === 0) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        throw new Error('Failed to generate a unique group code after multiple attempts');
      }

      // Get user's existing groups where they are admin
      console.log('Checking existing admin groups...');
      const adminGroups = await getDocuments([
        ['createdBy', '==', currentUser.uid]
      ]);

      // Check if user has too many groups
      if (adminGroups.length >= 3) {
        toast.error('You can only be an admin of up to 3 groups.');
        return;
      }

      const now = Timestamp.now();
      const groupData = {
        name: name.trim(),
        description: description.trim() || '',
        occasion,
        budget: budget || null,
        groupCode,
        giftExchangeDate: giftExchangeDate ? Timestamp.fromDate(new Date(giftExchangeDate)) : null,
        createdBy: currentUser.uid,
        members: [currentUser.uid],
        createdAt: now,
        updatedAt: now,
        maxMembers: MAX_MEMBERS,
        matchData: null
      };

      console.log('Creating group with data:', groupData);
      const groupId = await addDocument(groupData);
      console.log('Group created successfully with ID:', groupId);

      toast.success(
        <div>
          Group created successfully!
          <br />
          Share code: <strong>{formatGroupCode(groupCode)}</strong>
        </div>
      );
      onGroupCreated();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating group:', error);
      if (error instanceof Error) {
        toast.error(`Failed to create group: ${error.message}`);
      } else {
        toast.error('Failed to create group. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName('');
    setDescription('');
    setOccasion('');
    setBudget('');
    setGiftExchangeDate('');
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Create New Gift Exchange Group
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                After creating the group, you'll receive a unique code to share with others. Groups can have up to {MAX_MEMBERS} members.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={100}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Enter group name"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Describe your gift exchange group"
                  />
                </div>

                <div>
                  <label htmlFor="occasion" className="block text-sm font-medium text-gray-700">
                    Occasion *
                  </label>
                  <select
                    id="occasion"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="">Select an occasion</option>
                    {occasions.map((occ) => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                    Budget Range (Optional)
                  </label>
                  <select
                    id="budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="">Select a budget range</option>
                    {budgetRanges.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="giftExchangeDate" className="block text-sm font-medium text-gray-700">
                    Exchange Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="giftExchangeDate"
                    value={giftExchangeDate}
                    onChange={(e) => setGiftExchangeDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Group'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
