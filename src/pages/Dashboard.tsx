import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import GroupList from '../components/Groups/GroupList';
import CreateGroupModal from '../components/Groups/CreateGroupModal';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-text">
              Welcome, {currentUser?.displayName || 'User'}!
            </h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover active:bg-primary-active focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
            >
              Create New Group
            </button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="bg-background-paper overflow-hidden shadow-lg rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary/10 rounded-lg p-3">
                  <svg
                    className="h-6 w-6 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-text">My Groups</h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    View and manage your gift exchange groups
                  </p>
                  <Link
                    to="/groups"
                    className="mt-3 inline-flex items-center text-sm font-medium text-primary hover:text-primary-hover transition-colors duration-200"
                  >
                    View all groups
                    <svg
                      className="ml-1 h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-background-paper overflow-hidden shadow-lg rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-secondary/10 rounded-lg p-3">
                  <svg
                    className="h-6 w-6 text-secondary"
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
                  <h3 className="text-lg font-medium text-text">Profile</h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    Update your personal information
                  </p>
                  <Link
                    to="/profile"
                    className="mt-3 inline-flex items-center text-sm font-medium text-primary hover:text-primary-hover transition-colors duration-200"
                  >
                    Edit profile
                    <svg
                      className="ml-1 h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-background-paper overflow-hidden shadow-lg rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-secondary/10 rounded-lg p-3">
                  <svg
                    className="h-6 w-6 text-secondary"
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
                  <h3 className="text-lg font-medium text-text">Join a Group</h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    Enter a group code to join an existing gift exchange group
                  </p>
                  <Link
                    to="/join-group"
                    className="mt-3 inline-flex items-center text-sm font-medium text-primary hover:text-primary-hover transition-colors duration-200"
                  >
                    Join Group
                    <svg
                      className="ml-1 h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Groups */}
          <div className="bg-background-paper shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text mb-6">Recent Groups</h2>
            <GroupList />
          </div>
        </div>
      </main>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
