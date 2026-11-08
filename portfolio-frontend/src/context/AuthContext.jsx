import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { stocksApi, TOKEN_KEY } from '../api/stocksApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    stocksApi.me()
      .then(({ user }) => setUser(user))
      .catch((err) => {
        // Only drop the token when the server rejects it, not when it is unreachable.
        if (err.status === 401 || err.status === 403 || err.status === 404) logout();
      })
      .finally(() => setLoading(false));
  }, [logout]);

  const handleAuth = ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
    return user;
  };

  const value = {
    user,
    loading,
    login: async (email, password) => handleAuth(await stocksApi.login({ email, password })),
    signup: async (payload) => handleAuth(await stocksApi.signup(payload)),
    updateSectors: async (sectors) => {
      const { user } = await stocksApi.updatePreferences(sectors);
      setUser(user);
      return user;
    },
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export function RequireAuth({ children, allowUnonboarded = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/stocks/login" replace state={{ from: location.pathname }} />;
  if (!allowUnonboarded && !user.preferences.onboarded) return <Navigate to="/stocks/onboarding" replace />;
  return children;
}
