import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SectorPicker from './SectorPicker';
import { StocksPage, PageHeader, Eyebrow, Button, ErrorText, Card } from '../../styles/StocksStyles';

export default function SectorOnboarding() {
  const { user, updateSectors } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(user?.preferences.sectors || []);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      await updateSectors(selected);
      navigate('/stocks', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <StocksPage>
      <Card style={{ maxWidth: 760, margin: '1rem auto 0', padding: '2rem' }}>
        <PageHeader style={{ marginBottom: 0 }}>
          <div>
            <Eyebrow>Personalise your picks</Eyebrow>
            <h1>Which industries interest you, {user?.firstName}?</h1>
            <p>Your daily picks are ranked within these sectors. You can change them anytime in Settings.</p>
          </div>
        </PageHeader>
        <SectorPicker value={selected} onChange={setSelected} />
        {error && <ErrorText role="alert">{error}</ErrorText>}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button $primary onClick={save} disabled={busy || selected.length === 0}>
            {busy ? 'Saving…' : `Continue with ${selected.length || 'no'} sector${selected.length === 1 ? '' : 's'}`}
          </Button>
          <Button onClick={() => { setSelected([]); }} disabled={busy || !selected.length}>Clear</Button>
        </div>
      </Card>
    </StocksPage>
  );
}
