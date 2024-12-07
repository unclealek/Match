import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { FirebaseError } from 'firebase/app';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    console.log('Starting registration process...');
    console.log('Display Name:', displayName);

    if (!displayName.trim()) {
      console.log('Display name is empty');
      return toast.error('Please enter your name');
    }

    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      return toast.error('Passwords do not match');
    }

    if (password.length < 6) {
      console.log('Password too short');
      return toast.error('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      console.log('Attempting to create account with:', {
        email,
        displayName: displayName.trim()
      });
      
      // Create auth account with display name
      await signup(email, password, displayName.trim());
      console.log('Account created successfully');
      toast.success('Account created successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof FirebaseError) {
        console.log('Firebase error code:', error.code);
        switch (error.code) {
          case 'auth/email-already-in-use':
            toast.error('Email is already registered');
            break;
          case 'auth/invalid-email':
            toast.error('Invalid email address');
            break;
          case 'auth/operation-not-allowed':
            toast.error('Email/password accounts are not enabled. Please contact support.');
            break;
          case 'auth/weak-password':
            toast.error('Password is too weak');
            break;
          default:
            toast.error('Failed to create an account. Please try again.');
        }
      } else {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-background-paper p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-hover transition-all duration-200">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="displayName" className="sr-only">
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => {
                  console.log('Display name changed:', e.target.value);
                  setDisplayName(e.target.value);
                }}
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-text-secondary text-text bg-background-paper focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-all duration-200"
                placeholder="Display Name"
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-text-secondary text-text bg-background-paper focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-all duration-200"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-text-secondary text-text bg-background-paper focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-all duration-200"
                placeholder="Password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-text-secondary text-text bg-background-paper focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-all duration-200"
                placeholder="Confirm Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover active:bg-primary-active focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating Account...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
