import { useState } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface GiftSuggestion {
  id: string;
  name: string;
  description: string;
  priceRange: string;
  category: string;
  ageGroup: string;
  occasion: string;
}

export default function GiftMatcher() {
  const { currentUser } = useAuth();
  const { addDocument, getDocuments } = useFirestore('giftSuggestions');
  
  const [loading, setLoading] = useState(false);
  const [occasion, setOccasion] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [interests, setInterests] = useState('');
  const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([]);

  const occasions = [
    'Birthday',
    'Christmas',
    'Anniversary',
    'Wedding',
    'Graduation',
    'Baby Shower',
    'House Warming',
    'Other'
  ];

  const ageGroups = [
    '0-12',
    '13-17',
    '18-24',
    '25-34',
    '35-44',
    '45-54',
    '55+'
  ];

  const priceRanges = [
    'Under $25',
    '$25-$50',
    '$50-$100',
    '$100-$250',
    '$250-$500',
    '$500+'
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Store the search criteria
      await addDocument({
        userId: currentUser.uid,
        occasion,
        ageGroup,
        priceRange,
        interests,
        createdAt: new Date(),
      });

      // For now, we'll use some mock suggestions
      // In a real app, this would come from an API or ML model
      const mockSuggestions: GiftSuggestion[] = [
        {
          id: '1',
          name: 'Personalized Photo Album',
          description: 'A beautiful custom photo album to store precious memories.',
          priceRange: '$25-$50',
          category: 'Personalized',
          ageGroup: 'All',
          occasion: 'Any'
        },
        {
          id: '2',
          name: 'Hobby Starter Kit',
          description: 'A comprehensive starter kit for their favorite hobby.',
          priceRange: '$50-$100',
          category: 'Hobbies',
          ageGroup: 'All',
          occasion: 'Any'
        },
        {
          id: '3',
          name: 'Experience Gift Card',
          description: 'Gift card for local experiences and activities.',
          priceRange: '$100-$250',
          category: 'Experiences',
          ageGroup: 'All',
          occasion: 'Any'
        }
      ];

      setSuggestions(mockSuggestions);
      toast.success('Found some gift suggestions for you!');
    } catch (error) {
      console.error('Error getting gift suggestions:', error);
      toast.error('Failed to get gift suggestions');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Find the Perfect Gift</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Occasion */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            What's the occasion?
          </label>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            required
          >
            <option value="">Select an occasion</option>
            {occasions.map((occ) => (
              <option key={occ} value={occ}>{occ}</option>
            ))}
          </select>
        </div>

        {/* Age Group */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Recipient's age group
          </label>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            required
          >
            <option value="">Select age group</option>
            {ageGroups.map((age) => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Budget
          </label>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            required
          >
            <option value="">Select price range</option>
            {priceRanges.map((price) => (
              <option key={price} value={price}>{price}</option>
            ))}
          </select>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Recipient's interests (optional)
          </label>
          <textarea
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="e.g., hiking, cooking, reading, technology..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Finding gifts...' : 'Find Gift Suggestions'}
        </button>
      </form>

      {/* Gift Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Gift Suggestions
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h4 className="text-md font-medium text-gray-900">
                  {suggestion.name}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {suggestion.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {suggestion.priceRange}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {suggestion.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
