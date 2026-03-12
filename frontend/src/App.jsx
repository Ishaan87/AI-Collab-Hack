import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Discover from './pages/Discover';
import SmartMatch from './pages/SmartMatch';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Landing from './pages/Landing';

import ProfileBuilder from './pages/ProfileBuilder';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          <Route element={<DashboardLayout />}>
            <Route path="/discover" element={<Discover />} />
            <Route path="/smart-match" element={<SmartMatch />} />
            <Route path="/profile" element={<Profile />} />

            {/* Fallback routes */}
            <Route path="/my-teams" element={<div className="p-8 font-bold text-[#7856FF]">My Teams (Coming Soon)</div>} />
            <Route path="/sponsored" element={<div className="p-8 font-bold text-[#7856FF]">Sponsored Challenges (Coming Soon)</div>} />
            <Route path="/recommendations" element={<div className="p-8 font-bold text-[#7856FF]">My Recommendations (Coming Soon)</div>} />
            <Route path="/host" element={<div className="p-8 font-bold text-[#7856FF]">Host (Coming Soon)</div>} />
            <Route path="/activity" element={<div className="p-8 font-bold text-[#7856FF]">My Activity (Coming Soon)</div>} />
          </Route>

          <Route path="/profile/build" element={<ProfileBuilder />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
