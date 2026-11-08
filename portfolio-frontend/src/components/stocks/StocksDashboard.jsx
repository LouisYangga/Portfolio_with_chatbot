import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PortfolioTab from './PortfolioTab';
import TopPicksTab from './TopPicksTab';
import SettingsTab from './SettingsTab';
import { StocksPage, PageHeader, Eyebrow, Tabs, Tab } from '../../styles/StocksStyles';

const TABS = [
  { id: 'portfolio', label: 'My Portfolio' },
  { id: 'picks', label: 'Top Picks' },
  { id: 'settings', label: 'Settings' },
];

export default function StocksDashboard() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'portfolio';
  const [addRequest, setAddRequest] = useState(null);

  const setTab = (id) => setParams(id === 'portfolio' ? {} : { tab: id }, { replace: true });
  const clearAdd = useCallback(() => setAddRequest(null), []);

  return (
    <StocksPage>
      <PageHeader>
        <div>
          <Eyebrow>Stock Tracker</Eyebrow>
          <h1>Hi {user.firstName}</h1>
          <p>Following: {user.preferences.sectors.join(' · ') || 'no sectors yet'}</p>
        </div>
      </PageHeader>

      <Tabs role="tablist">
        {TABS.map((t) => (
          <Tab key={t.id} role="tab" aria-selected={tab === t.id} $active={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </Tab>
        ))}
      </Tabs>

      {tab === 'portfolio' && <PortfolioTab addRequest={addRequest} onAddHandled={clearAdd} />}
      {tab === 'picks' && <TopPicksTab onAdd={(ticker) => { setAddRequest(ticker); setTab('portfolio'); }} />}
      {tab === 'settings' && <SettingsTab />}
    </StocksPage>
  );
}
