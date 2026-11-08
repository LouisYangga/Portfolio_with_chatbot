import { useEffect, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiPlus } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { stocksApi } from '../../api/stocksApi';
import { money } from './format';
import {
  Toolbar, Segmented, Notice, PickList, PickCard, Score, Badge, ComponentGrid, Headlines, IconButton,
  EmptyState, ErrorText, ChipGrid, Chip,
} from '../../styles/StocksStyles';

const HORIZONS = [
  { id: 'long', label: 'Long term', blurb: 'Valuation, growth, quality, analyst & insider sentiment, long-run trend.' },
  { id: 'short', label: 'Short term', blurb: 'Momentum, news sentiment, trend, RSI and volume — moves fast day to day.' },
];

function ChangeBadge({ change }) {
  if (!change) return null;
  if (change.type === 'new') return <Badge $tone="new">NEW</Badge>;
  if (change.type === 'up') return <Badge $tone="up" aria-label={`Up ${change.by}`}>▲{change.by}</Badge>;
  if (change.type === 'down') return <Badge $tone="down" aria-label={`Down ${change.by}`}>▼{change.by}</Badge>;
  return null;
}

function ScoreBar({ label, value }) {
  const v = value == null ? null : Math.round(value);
  return (
    <Score>
      <span>{label}</span> <b>{v ?? '—'}</b>
      <div className="bar" aria-hidden><i style={{ width: `${v ?? 0}%` }} /></div>
    </Score>
  );
}

function Pick({ pick, onAdd }) {
  const [open, setOpen] = useState(false);
  return (
    <PickCard as="li">
      <div className="rank">#{pick.rank}</div>
      <div className="meta">
        <strong>{pick.ticker}</strong>
        <span>{pick.name}</span> <ChangeBadge change={pick.change} />
        <small>{pick.industry || pick.sector} · {money(pick.price)}</small>
      </div>
      <div className="right">
        <ScoreBar label="Score" value={pick.score} />
        <IconButton aria-label={`Add ${pick.ticker} to portfolio`} title="Add to portfolio" onClick={() => onAdd(pick.ticker)}><FiPlus /></IconButton>
        <IconButton aria-expanded={open} aria-label={open ? 'Hide details' : 'Why it ranks here'} onClick={() => setOpen(!open)}>
          {open ? <FiChevronUp /> : <FiChevronDown />}
        </IconButton>
      </div>
      {open && (
        <div className="details">
          <ComponentGrid>
            {(pick.components || []).map((c) => (
              <ScoreBar key={c.key} label={`${c.label} (${Math.round(c.weight * 100)}%)`} value={c.score} />
            ))}
          </ComponentGrid>
          {pick.topHeadlines?.length > 0 && (
            <>
              <small style={{ display: 'block', fontFamily: 'var(--font-mono)', marginBottom: '0.4rem' }}>Headlines driving sentiment</small>
              <Headlines>
                {pick.topHeadlines.map((h, i) => (
                  <li key={i}>
                    <Badge $tone={h.sentiment < 0 ? 'down' : h.sentiment > 0 ? 'up' : 'new'}>
                      {h.sentiment > 0 ? '+' : h.sentiment < 0 ? '−' : '·'}
                    </Badge>{' '}
                    {h.url ? <a href={h.url} target="_blank" rel="noopener noreferrer">{h.headline}</a> : h.headline}
                  </li>
                ))}
              </Headlines>
            </>
          )}
        </div>
      )}
    </PickCard>
  );
}

export default function TopPicksTab({ onAdd }) {
  const { user } = useAuth();
  const mySectors = user.preferences.sectors;
  const [horizon, setHorizon] = useState('long');
  const [sectors, setSectors] = useState(mySectors);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    stocksApi.rankings({ horizon, sectors })
      .then((d) => { if (!cancelled) { setData(d); setError(''); } })
      .catch((err) => { if (!cancelled) { setData(null); setError(err.status === 404 ? '' : err.message); } })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [horizon, sectors]);

  // Keep at least one sector selected — an empty filter would make the server fall back to all of them.
  const toggleSector = (s) => {
    if (sectors.includes(s)) {
      if (sectors.length > 1) setSectors(sectors.filter((x) => x !== s));
    } else {
      setSectors([...sectors, s]);
    }
  };
  const current = HORIZONS.find((h) => h.id === horizon);

  return (
    <>
      <Notice>
        Rankings are rebuilt every US trading day from prices, fundamentals, news and analyst sentiment.
        They are a rules-based screen, <strong>not financial advice</strong> — do your own research.
      </Notice>

      <Toolbar>
        <Segmented role="group" aria-label="Horizon">
          {HORIZONS.map((h) => (
            <button key={h.id} aria-pressed={horizon === h.id} onClick={() => setHorizon(h.id)}>{h.label}</button>
          ))}
        </Segmented>
        <small>
          {data?.updatedAt && `Last updated ${new Date(data.updatedAt).toLocaleString()}`}
        </small>
      </Toolbar>
      <p style={{ fontSize: 'var(--fz-xs)', marginBottom: '0.5rem' }}>{current.blurb}</p>

      {mySectors.length > 1 && (
        <ChipGrid style={{ margin: '0.5rem 0 1.25rem' }} role="group" aria-label="Filter sectors">
          {mySectors.map((s) => (
            <Chip key={s} $active={sectors.includes(s)} aria-pressed={sectors.includes(s)} onClick={() => toggleSector(s)}>{s}</Chip>
          ))}
        </ChipGrid>
      )}

      {data?.stale && <Notice $warn>Today’s update hasn’t run yet — showing the most recent rankings from {data.date}.</Notice>}
      {error && <ErrorText role="alert">{error}</ErrorText>}

      {loading ? (
        <p>Loading picks…</p>
      ) : !data?.picks?.length ? (
        <EmptyState>
          <h3>No rankings yet</h3>
          <p>{sectors.length ? 'Picks appear after the next daily ranking run (weekdays after the US market close).' : 'Select at least one sector above.'}</p>
        </EmptyState>
      ) : (
        <>
          <PickList>
            {data.picks.map((p) => <Pick key={p.ticker} pick={p} onAdd={onAdd} />)}
          </PickList>
          {data.droppedOut?.length > 0 && (
            <p style={{ fontSize: 'var(--fz-xs)', marginTop: '1rem' }}>
              Dropped out since last update: {data.droppedOut.map((d) => d.ticker).join(', ')}
            </p>
          )}
        </>
      )}
    </>
  );
}
