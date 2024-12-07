import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useFirestore } from '../hooks/useFirestore';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface UserProfile {
  displayName?: string;
  photoURL?: string;
  hobbies?: string[];
  activities?: string[];
  bio?: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getDocument, setDocument, updateDocument } = useFirestore('users');
  
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({});
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [newHobby, setNewHobby] = useState('');
  const [newActivity, setNewActivity] = useState('');

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser?.uid) return;

      try {
        const doc = await getDocument(currentUser.uid);
        if (doc) {
          setProfile(doc as UserProfile);
          setDisplayName((doc as UserProfile).displayName || '');
          setBio((doc as UserProfile).bio || '');
        } else {
          // Create initial profile if it doesn't exist
          const initialProfile = {
            displayName: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            hobbies: [],
            activities: [],
            bio: ''
          };
          await setDocument(currentUser.uid, initialProfile);
          setProfile(initialProfile);
          setDisplayName(initialProfile.displayName);
          setBio(initialProfile.bio);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast.error('Failed to load profile');
      }
    }

    loadProfile();
  }, [currentUser, getDocument, setDocument]);

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.uid) return;

    try {
      setLoading(true);
      
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      // Create a reference to the user's profile image
      const fileName = `profile-${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `users/${currentUser.uid}/profile/${fileName}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const url = await getDownloadURL(storageRef);
      
      // Update the user's profile
      await updateDocument(currentUser.uid, { photoURL: url });
      setProfile(prev => ({ ...prev, photoURL: url }));
      
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      await updateDocument(currentUser.uid, updates);
      setProfile(prev => ({ ...prev, ...updates }));
      toast.success('Profile updated!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  const handleDisplayNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
  };

  const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setBio(e.target.value);
  };

  const handleHobbyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewHobby(e.target.value);
  };

  const handleActivityChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewActivity(e.target.value);
  };

  const handleDisplayNameBlur = () => {
    if (displayName !== profile.displayName) {
      updateProfile({ displayName });
    }
  };

  const handleBioBlur = () => {
    if (bio !== profile.bio) {
      updateProfile({ bio });
    }
  };

  function addHobby() {
    if (!newHobby.trim()) return;
    const hobbies = [...(profile.hobbies || []), newHobby.trim()];
    updateProfile({ hobbies });
    setNewHobby('');
  }

  function addActivity() {
    if (!newActivity.trim()) return;
    const activities = [...(profile.activities || []), newActivity.trim()];
    updateProfile({ activities });
    setNewActivity('');
  }

  function removeHobby(index: number) {
    const hobbies = profile.hobbies?.filter((_, i) => i !== index);
    updateProfile({ hobbies });
  }

  function removeActivity(index: number) {
    const activities = profile.activities?.filter((_, i) => i !== index);
    updateProfile({ activities });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="p-6 space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={profile.photoURL || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow cursor-pointer hover:bg-gray-50"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </label>
                  <input
                    type="file"
                    id="photo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                </div>
                {loading && (
                  <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                )}
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={handleDisplayNameChange}
                  onBlur={handleDisplayNameBlur}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Enter your name"
                  disabled={loading}
                  dir="ltr"
                  style={{ textAlign: 'left' }}
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={handleBioChange}
                  onBlur={handleBioBlur}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Tell us about yourself"
                  disabled={loading}
                  dir="ltr"
                  style={{ textAlign: 'left' }}
                />
              </div>

              {/* Hobbies */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Hobbies
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    value={newHobby}
                    onChange={handleHobbyChange}
                    onKeyPress={(e) => e.key === 'Enter' && addHobby()}
                    className="flex-1 rounded-none rounded-l-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Add a hobby"
                    disabled={loading}
                    dir="ltr"
                    style={{ textAlign: 'left' }}
                  />
                  <button
                    type="button"
                    onClick={addHobby}
                    className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    disabled={loading}
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.hobbies?.map((hobby, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800"
                    >
                      {hobby}
                      <button
                        type="button"
                        onClick={() => removeHobby(index)}
                        className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:bg-blue-500 focus:text-white focus:outline-none"
                      >
                        <span className="sr-only">Remove {hobby}</span>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Activities
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    value={newActivity}
                    onChange={handleActivityChange}
                    onKeyPress={(e) => e.key === 'Enter' && addActivity()}
                    className="flex-1 rounded-none rounded-l-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Add an activity"
                    disabled={loading}
                    dir="ltr"
                    style={{ textAlign: 'left' }}
                  />
                  <button
                    type="button"
                    onClick={addActivity}
                    className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    disabled={loading}
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.activities?.map((activity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800"
                    >
                      {activity}
                      <button
                        type="button"
                        onClick={() => removeActivity(index)}
                        className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-green-600 hover:bg-green-200 hover:text-green-500 focus:bg-green-500 focus:text-white focus:outline-none"
                      >
                        <span className="sr-only">Remove {activity}</span>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
