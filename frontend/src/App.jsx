import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Onboard        from './pages/Onboard';
import AuthCallback   from './pages/AuthCallback';
import Landing        from './pages/Landing';
import UpdateProfile  from './pages/UpdateProfile';
import ProfileBuilder from './pages/ProfileBuilder';
import Discover       from './pages/Discover';
import Leaderboard    from './pages/Leaderboard';
import MyTeams        from './pages/MyTeams';
import Profile        from './pages/Profile';
import SmartMatch     from './pages/SmartMatch';
import DashboardLayout from './components/DashboardLayout';
import HostEvent       from './pages/HostEvent';
import CompetitionDetail from './pages/CompetitionDetail';
import MyEvents        from './pages/MyEvents';

import './App.css';
import './index.css';

// ─── Guards ──────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#7856FF] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

const PublicOnly = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  if (token) return <Navigate to="/discover" replace />;
  return children;
};

// ─── Routes ──────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"        element={<Landing />} />
      <Route path="/login"   element={<PublicOnly><Onboard /></PublicOnly>} />
      <Route path="/onboard" element={<PublicOnly><Onboard /></PublicOnly>} />

      {/* OAuth callback — no guard needed */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Profile setup — protected but outside DashboardLayout */}
      <Route path="/update-profile" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
      <Route path="/profile/build"  element={<ProtectedRoute><ProfileBuilder /></ProtectedRoute>} />

      {/* Dashboard pages — inside DashboardLayout */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/discover"              element={<Discover />} />
        <Route path="/leaderboard"           element={<Leaderboard />} />
        <Route path="/my-teams"              element={<MyTeams />} />
        <Route path="/profile"               element={<Profile />} />
        <Route path="/profile/:username"     element={<Profile />} />
        <Route path="/smart-match"           element={<SmartMatch />} />
        <Route path="/competitions/new"      element={<HostEvent />} />
        <Route path="/competitions/:id"      element={<CompetitionDetail />} />
        <Route path="/my-events"             element={<MyEvents />} />

        {/* Placeholders */}
        <Route path="/sponsored"      element={<div className="p-8 font-bold text-[#7856FF]">Sponsored Challenges (Coming Soon)</div>} />
        <Route path="/recommendations" element={<div className="p-8 font-bold text-[#7856FF]">My Recommendations (Coming Soon)</div>} />
        <Route path="/activity"       element={<div className="p-8 font-bold text-[#7856FF]">My Activity (Coming Soon)</div>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/discover" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}