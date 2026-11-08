import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Overlay, ModalCard, Button, ErrorText } from '../../styles/StocksStyles';

/**
 * In-page confirmation dialog. Used instead of window.confirm(), which embedded
 * browsers and some popup blockers suppress (it silently returns false).
 */
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', busy, error, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => cancelRef.current?.focus(), 50);
    const onKey = (e) => e.key === 'Escape' && !busy && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && !busy && onCancel()}>
          <ModalCard role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-msg" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
            <h2 id="confirm-title">{title}</h2>
            <p id="confirm-msg" style={{ fontSize: 'var(--fz-sm)', marginBottom: '1.25rem' }}>{message}</p>
            {error && <ErrorText role="alert">{error}</ErrorText>}
            <div className="actions">
              <Button ref={cancelRef} type="button" onClick={onCancel} disabled={busy}>Cancel</Button>
              <Button $danger type="button" onClick={onConfirm} disabled={busy}>{busy ? 'Removing…' : confirmLabel}</Button>
            </div>
          </ModalCard>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
