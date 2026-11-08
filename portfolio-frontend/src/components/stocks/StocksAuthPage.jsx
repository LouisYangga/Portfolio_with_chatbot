import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StocksPage, AuthCard, Eyebrow, Field, Button, ErrorText } from '../../styles/StocksStyles';

export default function StocksAuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.preferences.onboarded ? '/stocks' : '/stocks/onboarding'} replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const u = isSignup ? await signup(form) : await login(form.email, form.password);
      navigate(u.preferences.onboarded ? location.state?.from || '/stocks' : '/stocks/onboarding', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <StocksPage>
      <AuthCard>
        <Eyebrow>Stock Tracker</Eyebrow>
        <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p>
          {isSignup
            ? 'Track your holdings and get daily long- and short-term picks in the industries you follow.'
            : 'Log in to see your portfolio and today’s picks.'}
        </p>
        <form onSubmit={onSubmit} noValidate>
          {isSignup && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Field style={{ flex: 1 }}>
                <span>First name</span>
                <input value={form.firstName} onChange={set('firstName')} autoComplete="given-name" required />
              </Field>
              <Field style={{ flex: 1 }}>
                <span>Last name</span>
                <input value={form.lastName} onChange={set('lastName')} autoComplete="family-name" />
              </Field>
            </div>
          )}
          <Field>
            <span>Email</span>
            <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
          </Field>
          <Field>
            <span>Password{isSignup && ' (8+ characters)'}</span>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={isSignup ? 8 : undefined}
              required
            />
          </Field>
          {error && <ErrorText role="alert">{error}</ErrorText>}
          <Button $primary type="submit" disabled={busy}>
            {busy ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
          </Button>
        </form>
        <footer>
          {isSignup ? (
            <>Already have an account? <Link to="/stocks/login">Log in</Link></>
          ) : (
            <>New here? <Link to="/stocks/signup">Create an account</Link></>
          )}
        </footer>
      </AuthCard>
    </StocksPage>
  );
}
