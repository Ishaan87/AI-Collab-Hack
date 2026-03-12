import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // On mount, if token exists fetch /me to hydrate user
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetchMe(token);
  }, []);

  const fetchMe = async (tkn) => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setUser(data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Called from /auth/callback page after OAuth redirect
  const loginWithToken = (tkn) => {
    localStorage.setItem('token', tkn);
    setToken(tkn);
    fetchMe(tkn);  // sets loading=true internally, prevents redirect race
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = () => token && fetchMe(token);

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithToken, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
