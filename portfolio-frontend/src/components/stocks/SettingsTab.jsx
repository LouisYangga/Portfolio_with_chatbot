import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import SectorPicker from './SectorPicker';
import { Card, Button, ErrorText } from '../../styles/StocksStyles';

export default function SettingsTab() {
  const { user, updateSectors, logout } = useAuth();
  const [selected, setSelected] = useState(user.preferences.sectors);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const dirty = [...selected].sort().join() !== [...user.preferences.sectors].sort().join();

  const save = async () => {
    setError('');
    try {
      await updateSectors(selected);
      setStatus('Saved — your picks now use these sectors.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Card>
        <h3 style={{ color: 'var(--lightest-slate)', fontSize: 'var(--fz-lg)' }}>Industries you follow</h3>
        <SectorPicker value={selected} onChange={(v) => { setSelected(v); setStatus(''); }} />
        {error && <ErrorText role="alert">{error}</ErrorText>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Button $primary onClick={save} disabled={!dirty || selected.length === 0}>Save sectors</Button>
          {status && <small role="status">{status}</small>}
        </div>
      </Card>
      <Card>
        <h3 style={{ color: 'var(--lightest-slate)', fontSize: 'var(--fz-lg)', marginBottom: '0.4rem' }}>Account</h3>
        <p style={{ fontSize: 'var(--fz-sm)', marginBottom: '1rem' }}>Signed in as {user.email}</p>
        <Button onClick={logout}>Log out</Button>
      </Card>
    </div>
  );
}
