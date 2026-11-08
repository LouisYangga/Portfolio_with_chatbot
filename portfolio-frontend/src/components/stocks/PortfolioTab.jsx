import { useCallback, useEffect, useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { stocksApi } from '../../api/stocksApi';
import HoldingModal from './HoldingModal';
import ConfirmDialog from './ConfirmDialog';
import { SummarySkeleton, TableSkeleton } from './Skeleton';
import { useAuth } from '../../context/AuthContext';
import { money, signedMoney, pct, num } from './format';
import {
  SummaryGrid, Stat, Signed, TableWrap, Table, Ticker, Button, IconButton, Toolbar, EmptyState, ErrorText, Notice,
} from '../../styles/StocksStyles';

const REFRESH_MS = 60 * 1000;

// Last portfolio response, per user, for an instant first paint (this tab only).
const cacheKey = (userId) => `portfolioCache:${userId}`;
function readCache(userId) {
  try { return JSON.parse(sessionStorage.getItem(cacheKey(userId))) || null; } catch { return null; }
}
function writeCache(userId, data) {
  try { sessionStorage.setItem(cacheKey(userId), JSON.stringify(data)); } catch { /* ignore */ }
}

export default function PortfolioTab({ addRequest, onAddHandled }) {
  const { user } = useAuth();
  const [data, setData] = useState(() => readCache(user.id));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(() => !readCache(user.id));
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState({ open: false, holding: null, presetTicker: '' });

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const fresh = await stocksApi.portfolio();
      setData(fresh);
      writeCache(user.id, fresh);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => {
    load();
    const id = setInterval(() => document.visibilityState === 'visible' && load(), REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  // "Add to portfolio" from the Top Picks tab.
  useEffect(() => {
    if (addRequest) {
      setModal({ open: true, holding: null, presetTicker: addRequest });
      onAddHandled();
    }
  }, [addRequest, onAddHandled]);

  const [pendingDelete, setPendingDelete] = useState({ holding: null, busy: false, error: '' });
  const closeDelete = useCallback(() => setPendingDelete({ holding: null, busy: false, error: '' }), []);

  const confirmDelete = async () => {
    const h = pendingDelete.holding;
    setPendingDelete((p) => ({ ...p, busy: true, error: '' }));
    try {
      await stocksApi.deleteHolding(h.id);
      // Drop the row immediately; the reload recalculates the totals.
      setData((d) => d && { ...d, holdings: d.holdings.filter((x) => x.id !== h.id) });
      closeDelete();
      load();
    } catch (err) {
      if (err.status === 404) { closeDelete(); load(); return; } // already gone
      setPendingDelete((p) => ({ ...p, busy: false, error: err.message }));
    }
  };

  const holdings = data?.holdings || [];
  const s = data?.summary;

  return (
    <>
      {loading && <SummarySkeleton />}
      {s && holdings.length > 0 && (
        <SummaryGrid>
          <Stat><span>Market value</span><strong>{money(s.totalValue)}</strong></Stat>
          <Stat><span>Total cost</span><strong>{money(s.totalCost)}</strong></Stat>
          <Stat>
            <span>Total gain / loss</span>
            <strong><Signed $value={s.totalPl}>{signedMoney(s.totalPl)}</Signed></strong>
            <small><Signed $value={s.totalPl}>{pct(s.totalPlPercent)}</Signed></small>
          </Stat>
          <Stat><span>Today</span><strong><Signed $value={s.dayChange}>{signedMoney(s.dayChange)}</Signed></strong></Stat>
        </SummaryGrid>
      )}

      <Toolbar>
        <small>
          {refreshing && data ? 'Updating prices…' : data?.asOf && `Prices as of ${new Date(data.asOf).toLocaleTimeString()} · refreshes every minute`}
        </small>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button onClick={load} aria-label="Refresh prices" disabled={refreshing}><FiRefreshCw /></Button>
          <Button $primary onClick={() => setModal({ open: true, holding: null, presetTicker: '' })}><FiPlus /> Add holding</Button>
        </div>
      </Toolbar>

      {error && <ErrorText role="alert">{error}</ErrorText>}
      {s?.unpriced > 0 && <Notice $warn>{s.unpriced} holding(s) have no live price right now and are excluded from totals.</Notice>}

      {loading ? (
        <TableSkeleton />
      ) : holdings.length === 0 ? (
        <EmptyState>
          <h3>Your portfolio is empty</h3>
          <p>Add the stocks you own with your average buy price to see how much you’re up or down.</p>
          <Button $primary onClick={() => setModal({ open: true, holding: null, presetTicker: '' })}><FiPlus /> Add your first holding</Button>
        </EmptyState>
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Stock</th><th>Shares</th><th>Avg price</th><th>Price</th><th>Day</th>
                <th>Value</th><th>Gain / loss</th><th>%</th><th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.id}>
                  <td><Ticker><strong>{h.ticker}</strong><small title={h.name}>{h.name}</small></Ticker></td>
                  <td>{num(h.shares)}</td>
                  <td>{money(h.avgPrice)}</td>
                  <td>{money(h.price)}{h.stale && ' *'}</td>
                  <td><Signed $value={h.changePercent}>{pct(h.changePercent)}</Signed></td>
                  <td>{money(h.value)}</td>
                  <td><Signed $value={h.pl}>{signedMoney(h.pl)}</Signed></td>
                  <td><Signed $value={h.plPercent}>{pct(h.plPercent)}</Signed></td>
                  <td>
                    <IconButton aria-label={`Edit ${h.ticker}`} onClick={() => setModal({ open: true, holding: h, presetTicker: '' })}><FiEdit2 /></IconButton>
                    <IconButton $danger aria-label={`Remove ${h.ticker}`} onClick={() => setPendingDelete({ holding: h, busy: false, error: '' })}><FiTrash2 /></IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}

      <HoldingModal
        open={modal.open}
        holding={modal.holding}
        presetTicker={modal.presetTicker}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onSaved={load}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete.holding)}
        title={`Remove ${pendingDelete.holding?.ticker ?? ''}?`}
        message={`This removes ${pendingDelete.holding?.ticker ?? 'this stock'} and its buy price from your portfolio. You can add it again later.`}
        confirmLabel="Remove"
        busy={pendingDelete.busy}
        error={pendingDelete.error}
        onConfirm={confirmDelete}
        onCancel={closeDelete}
      />
    </>
  );
}
