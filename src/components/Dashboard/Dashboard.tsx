import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestore } from '../../hooks/useFirestore';
import { ProfileForm } from '../Profile/ProfileForm';
import GroupList from '../Groups/GroupList';
import CreateGroupModal from '../Groups/CreateGroupModal';
import { Link } from 'react-router-dom';
import { theme } from '../../styles/theme';

interface UserProfile {
  displayName: string;
  bio: string;
  photoURL: string;
  createdAt: Date;
}

export function Dashboard() {
  const { currentUser } = useAuth();
  const { getDocument } = useFirestore('users');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;

      try {
        const userProfile = await getDocument(currentUser.uid);
        setProfile(userProfile as UserProfile);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, getDocument]);

  if (loading) {
    return (
      <div className="bg-background" style={{ backgroundColor: theme.colors.background.main }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.main }}>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold" style={{ color: theme.colors.text.primary }}>
              Welcome, {currentUser?.displayName || 'User'}!
            </h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium shadow-sm text-${theme.colors.text.primary} bg-${theme.colors.primary.main} hover:bg-${theme.colors.primary.hover} active:bg-${theme.colors.primary.main} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.colors.primary.main} transition-all duration-200`}
            >
              Create New Group
            </button>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md p-3" style={{ backgroundColor: theme.colors.primary.main }}>
                      <svg
                        className="h-6 w-6"
                        style={{ color: theme.colors.text.white }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium" style={{ color: theme.colors.text.primary }}>My Groups</h3>
                      <div className="mt-1">
                        <Link
                          to="/groups"
                          className="text-sm font-medium transition-colors duration-200"
                          style={{
                            color: theme.colors.primary.main,
                            '&:hover': {
                              color: theme.colors.primary.hover
                            }
                          }}
                        >
                          View all groups →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md p-3" style={{ backgroundColor: theme.colors.secondary.main }}>
                      <svg
                        className="h-6 w-6"
                        style={{ color: theme.colors.text.white }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium" style={{ color: theme.colors.text.primary }}>My Profile</h3>
                      <div className="mt-1">
                        <Link
                          to="/profile"
                          className="text-sm font-medium transition-colors duration-200"
                          style={{
                            color: theme.colors.primary.main,
                            '&:hover': {
                              color: theme.colors.primary.hover
                            }
                          }}
                        >
                          View profile →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-medium mb-4" style={{ color: theme.colors.text.primary }}>Recent Groups</h2>
              <GroupList />
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-medium mb-4" style={{ color: theme.colors.text.primary }}>Profile Information</h2>
              {profile ? (
                <div className="space-y-4">
                  {profile.photoURL && (
                    <img
                      src={profile.photoURL}
                      alt={profile.displayName}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-medium" style={{ color: theme.colors.text.primary }}>
                      {profile.displayName || 'Anonymous User'}
                    </h3>
                    <p style={{ color: theme.colors.text.secondary }}>{profile.bio}</p>
                  </div>
                </div>
              ) : (
                <p style={{ color: theme.colors.text.secondary }}>No profile information available.</p>
              )}
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-medium mb-4" style={{ color: theme.colors.text.primary }}>Edit Profile</h2>
              <ProfileForm />
            </div>
          </div>
        </div>
      </div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
