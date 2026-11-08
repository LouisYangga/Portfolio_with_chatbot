import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { stocksApi } from '../../api/stocksApi';
import { Overlay, ModalCard, Field, Button, ErrorText, Suggestions } from '../../styles/StocksStyles';

/** Add (holding = null, optional presetTicker) or edit an existing holding. */
export default function HoldingModal({ open, holding, presetTicker, onClose, onSaved }) {
  const isEdit = Boolean(holding);
  const [form, setForm] = useState({ ticker: '', shares: '', avgPrice: '', notes: '' });
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const firstInput = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm(holding
      ? { ticker: holding.ticker, shares: String(holding.shares), avgPrice: String(holding.avgPrice), notes: holding.notes || '' }
      : { ticker: presetTicker || '', shares: '', avgPrice: '', notes: '' });
    setError('');
    setSuggestions([]);
    setTimeout(() => firstInput.current?.focus(), 50);
  }, [open, holding, presetTicker]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Debounced ticker autocomplete (best-effort — free-text tickers still work).
  useEffect(() => {
    if (isEdit || !open) return;
    const q = form.ticker.trim();
    if (q.length < 1) return setSuggestions([]);
    const t = setTimeout(() => {
      stocksApi.search(q).then((d) => setSuggestions(d?.results?.slice(0, 8) || [])).catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(t);
  }, [form.ticker, isEdit, open]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const shares = Number(form.shares);
    const avgPrice = Number(form.avgPrice);
    if (!isEdit && !form.ticker.trim()) return setError('Enter a ticker');
    if (form.shares === '' || !Number.isFinite(shares) || shares < 0) return setError('Shares must be 0 or more');
    if (form.avgPrice === '' || !Number.isFinite(avgPrice) || avgPrice < 0) return setError('Average buy price must be 0 or more');

    setBusy(true);
    setError('');
    try {
      const payload = { shares, avgPrice, notes: form.notes };
      if (isEdit) await stocksApi.updateHolding(holding.id, payload);
      else await stocksApi.addHolding({ ...payload, ticker: form.ticker.trim() });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <ModalCard role="dialog" aria-modal="true" aria-labelledby="holding-title" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
            <h2 id="holding-title">{isEdit ? `Edit ${holding.ticker}` : 'Add a holding'}</h2>
            <form onSubmit={submit} noValidate>
              {!isEdit && (
                <>
                  <Field>
                    <span>Ticker</span>
                    <input ref={firstInput} value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })} placeholder="e.g. AAPL" autoComplete="off" />
                  </Field>
                  {suggestions.length > 0 && suggestions[0].ticker !== form.ticker.toUpperCase() && (
                    <Suggestions>
                      {suggestions.map((s) => (
                        <li key={s.ticker}>
                          <button type="button" onClick={() => { setForm({ ...form, ticker: s.ticker }); setSuggestions([]); }}>
                            <strong>{s.ticker}</strong>{s.name}
                          </button>
                        </li>
                      ))}
                    </Suggestions>
                  )}
                </>
              )}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Field style={{ flex: 1 }}>
                  <span>Shares</span>
                  <input ref={isEdit ? firstInput : undefined} type="number" inputMode="decimal" min="0" step="any" value={form.shares} onChange={set('shares')} onFocus={(e) => e.target.select()} />
                </Field>
                <Field style={{ flex: 1 }}>
                  <span>Avg buy price (USD)</span>
                  <input type="number" inputMode="decimal" min="0" step="any" value={form.avgPrice} onChange={set('avgPrice')} onFocus={(e) => e.target.select()} />
                </Field>
              </div>
              <Field>
                <span>Notes (optional)</span>
                <textarea rows={2} maxLength={500} value={form.notes} onChange={set('notes')} />
              </Field>
              {error && <ErrorText role="alert">{error}</ErrorText>}
              <div className="actions">
                <Button type="button" onClick={onClose}>Cancel</Button>
                <Button $primary type="submit" disabled={busy}>{busy ? 'Saving…' : isEdit ? 'Save' : 'Add'}</Button>
              </div>
            </form>
          </ModalCard>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
