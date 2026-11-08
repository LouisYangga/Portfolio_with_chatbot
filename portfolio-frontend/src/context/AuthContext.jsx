import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { stocksApi, TOKEN_KEY } from '../api/stocksApi';
import { StocksPage } from '../styles/StocksStyles';
import { PageSkeleton } from '../components/stocks/Skeleton';

const AuthContext = createContext(null);
const PROFILE_KEY = 'userProfile';

// Storage can throw (private mode, blocked site data) — never let that break the page.
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* ignore */ } },
  remove(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } },
};

function readCachedUser() {
  if (!storage.get(TOKEN_KEY)) return null;
  try { return JSON.parse(storage.get(PROFILE_KEY)) || null; } catch { return null; }
}

export function AuthProvider({ children }) {
  // Start from the cached profile so the dashboard renders instantly; /me revalidates in the background.
  const [user, setUserState] = useState(readCachedUser);
  const [loading, setLoading] = useState(() => Boolean(storage.get(TOKEN_KEY)) && !readCachedUser());

  const setUser = useCallback((u) => {
    setUserState(u);
    if (u) storage.set(PROFILE_KEY, JSON.stringify(u));
    else storage.remove(PROFILE_KEY);
  }, []);

  const logout = useCallback(() => {
    storage.remove(TOKEN_KEY);
    setUser(null);
    // Drop cached portfolios only — the chatbot keeps its own memory in sessionStorage.
    try {
      Object.keys(sessionStorage).filter((k) => k.startsWith('portfolioCache:')).forEach((k) => sessionStorage.removeItem(k));
    } catch { /* ignore */ }
  }, [setUser]);

  useEffect(() => {
    if (!storage.get(TOKEN_KEY)) return;
    stocksApi.me()
      .then(({ user }) => setUser(user))
      .catch((err) => {
        // Only drop the session when the server rejects the token, not when it is unreachable.
        if (err.status === 401 || err.status === 403 || err.status === 404) logout();
      })
      .finally(() => setLoading(false));
  }, [logout, setUser]);

  const handleAuth = ({ token, user }) => {
    storage.set(TOKEN_KEY, token);
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
  if (loading) return <StocksPage aria-busy="true"><PageSkeleton /></StocksPage>;
  if (!user) return <Navigate to="/stocks/login" replace state={{ from: location.pathname }} />;
  if (!allowUnonboarded && !user.preferences.onboarded) return <Navigate to="/stocks/onboarding" replace />;
  return children;
}
