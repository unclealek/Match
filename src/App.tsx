import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navigation/Navbar';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import NotFound from './pages/NotFound';
import GroupList from './components/Groups/GroupList';
import GroupDetails from './components/Groups/GroupDetails';
import JoinGroup from './pages/JoinGroup'; // Added import statement for JoinGroup component

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Toaster position="top-right" />
          <Routes>
            {/* Auth routes without navbar */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected routes with navbar */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-100">
                    <Navbar />
                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                      <Dashboard />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-100">
                    <Navbar />
                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                      <Profile />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-100">
                    <Navbar />
                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                      <GroupList />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:groupId"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-100">
                    <Navbar />
                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                      <GroupDetails />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/join-group"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-100">
                    <Navbar />
                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                      <JoinGroup />
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
