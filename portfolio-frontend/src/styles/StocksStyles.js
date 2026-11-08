import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export const StocksPage = styled.main`
  --gain: #64ffda;
  --loss: #ff6b81;
  --gain-bg: rgba(100, 255, 218, 0.1);
  --loss-bg: rgba(255, 107, 129, 0.1);

  max-width: 1200px;
  margin: 0 auto;
  padding: 110px 50px 80px;
  min-height: 100vh;
  color: var(--slate);
  font-size: var(--fz-md);

  @media (max-width: 768px) {
    padding: 96px 16px 60px;
  }
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;

  h1 {
    color: var(--lightest-slate);
    font-size: clamp(26px, 4vw, 36px);
    line-height: 1.1;
  }
  p {
    margin-top: 0.4rem;
    font-size: var(--fz-sm);
  }
`;

export const Eyebrow = styled.span`
  display: block;
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--green);
  margin-bottom: 0.5rem;
`;

export const Tabs = styled.div`
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid var(--lightest-navy);
  margin-bottom: 1.75rem;
  overflow-x: auto;
`;

export const Tab = styled.button`
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--slate);
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  padding: 0.75rem 1rem;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s, border-color 0.2s;

  &:hover { color: var(--green); }
  ${({ $active }) => $active && css`
    color: var(--green);
    border-bottom-color: var(--green);
  `}
`;

export const Card = styled.div`
  background: var(--light-navy);
  border-radius: 6px;
  padding: 1.25rem;
  box-shadow: 0 10px 30px -15px rgba(2, 12, 27, 0.7);
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 900px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

export const Stat = styled(Card)`
  > span {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.4rem;
  }
  strong {
    display: block;
    color: var(--lightest-slate);
    font-size: clamp(18px, 2.4vw, 24px);
    font-variant-numeric: tabular-nums;
  }
  small { font-size: var(--fz-xs); font-variant-numeric: tabular-nums; }
`;

export const Signed = styled.span`
  font-variant-numeric: tabular-nums;
  color: ${({ $value }) => ($value > 0 ? 'var(--gain)' : $value < 0 ? 'var(--loss)' : 'var(--slate)')};
`;

export const TableWrap = styled(Card)`
  padding: 0;
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fz-sm);

  th, td {
    padding: 0.85rem 1rem;
    text-align: right;
    white-space: nowrap;
  }
  th:first-child, td:first-child { text-align: left; }
  th {
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--lightest-navy);
  }
  td { font-variant-numeric: tabular-nums; color: var(--light-slate); }
  tbody tr { border-bottom: 1px solid rgba(35, 53, 84, 0.6); }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: rgba(35, 53, 84, 0.35); }
`;

export const Ticker = styled.div`
  strong { color: var(--lightest-slate); font-family: var(--font-mono); }
  small { display: block; color: var(--slate); font-size: var(--fz-xxs); max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
`;

export const Button = styled.button`
  background: ${({ $primary }) => ($primary ? 'var(--green)' : 'transparent')};
  color: ${({ $primary, $danger }) => ($primary ? 'var(--navy)' : $danger ? 'var(--loss)' : 'var(--green)')};
  border: 1px solid ${({ $danger }) => ($danger ? 'var(--loss)' : 'var(--green)')};
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  padding: 0.65rem 1.1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background 0.2s, color 0.2s, opacity 0.2s;

  &:hover:not(:disabled) {
    background: ${({ $primary, $danger }) => ($primary ? 'rgba(100,255,218,0.85)' : $danger ? 'var(--loss-bg)' : 'rgba(100,255,218,0.1)')};
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  color: var(--slate);
  cursor: pointer;
  padding: 0.35rem;
  display: inline-flex;
  font-size: 16px;
  &:hover { color: ${({ $danger }) => ($danger ? 'var(--loss)' : 'var(--green)')}; }
`;

export const Field = styled.label`
  display: block;
  margin-bottom: 1rem;

  span {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
    margin-bottom: 0.4rem;
  }
  input, textarea {
    width: 100%;
    background: var(--navy);
    border: 1px solid var(--lightest-navy);
    border-radius: 4px;
    color: var(--lightest-slate);
    font-family: var(--font-sans);
    font-size: var(--fz-md);
    padding: 0.7rem 0.8rem;
    &:focus { outline: none; border-color: var(--green); }
  }
`;

export const ErrorText = styled.p`
  color: var(--loss);
  font-size: var(--fz-sm);
  margin-bottom: 1rem;
`;

export const AuthCard = styled(Card)`
  max-width: 420px;
  margin: 2rem auto 0;
  padding: 2rem;

  h1 { color: var(--lightest-slate); font-size: 28px; margin-bottom: 0.5rem; }
  > p { font-size: var(--fz-sm); margin-bottom: 1.5rem; }
  form ${Button} { width: 100%; margin-top: 0.5rem; }
  footer { margin-top: 1.25rem; font-size: var(--fz-sm); text-align: center; }
  a { color: var(--green); text-decoration: none; }
`;

export const ChipGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 1.25rem 0 1.75rem;
`;

export const Chip = styled.button`
  border-radius: 999px;
  padding: 0.55rem 1rem;
  font-size: var(--fz-sm);
  cursor: pointer;
  border: 1px solid ${({ $active }) => ($active ? 'var(--green)' : 'var(--lightest-navy)')};
  background: ${({ $active }) => ($active ? 'rgba(100,255,218,0.1)' : 'var(--light-navy)')};
  color: ${({ $active }) => ($active ? 'var(--green)' : 'var(--light-slate)')};
  transition: all 0.2s;
  &:hover { border-color: var(--green); }
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

export const Segmented = styled.div`
  display: inline-flex;
  border: 1px solid var(--lightest-navy);
  border-radius: 6px;
  overflow: hidden;

  button {
    background: none;
    border: none;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
    padding: 0.55rem 0.9rem;
    cursor: pointer;
  }
  button[aria-pressed='true'] { background: rgba(100,255,218,0.1); color: var(--green); }
`;

export const Notice = styled.div`
  border-left: 2px solid ${({ $warn }) => ($warn ? 'var(--loss)' : 'var(--green)')};
  background: var(--light-navy);
  padding: 0.75rem 1rem;
  font-size: var(--fz-xs);
  border-radius: 0 4px 4px 0;
  margin-bottom: 1rem;
`;

export const EmptyState = styled(Card)`
  text-align: center;
  padding: 3rem 1.5rem;
  h3 { color: var(--lightest-slate); margin-bottom: 0.5rem; font-size: var(--fz-xl); }
  p { font-size: var(--fz-sm); margin-bottom: 1.25rem; }
`;

export const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(2, 12, 27, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

export const ModalCard = styled(motion.div)`
  background: var(--light-navy);
  border-radius: 6px;
  padding: 1.75rem;
  width: 100%;
  max-width: 440px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;

  h2 { color: var(--lightest-slate); font-size: var(--fz-xxl); margin-bottom: 1.25rem; }
  .actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem; }
`;

export const Suggestions = styled.ul`
  list-style: none;
  margin: -0.6rem 0 1rem;
  border: 1px solid var(--lightest-navy);
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;

  li button {
    width: 100%;
    text-align: left;
    background: var(--navy);
    border: none;
    color: var(--light-slate);
    padding: 0.55rem 0.8rem;
    font-size: var(--fz-sm);
    cursor: pointer;
    &:hover { background: var(--lightest-navy); }
  }
  strong { font-family: var(--font-mono); color: var(--green); margin-right: 0.5rem; }
`;

export const PickList = styled.ol`
  list-style: none;
  display: grid;
  gap: 0.75rem;
`;

export const PickCard = styled(Card)`
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 0.75rem 1rem;
  align-items: center;
  padding: 1rem 1.25rem;

  .rank { font-family: var(--font-mono); color: var(--green); font-size: var(--fz-lg); }
  .meta { min-width: 0; }
  .meta strong { color: var(--lightest-slate); font-family: var(--font-mono); margin-right: 0.5rem; }
  .meta span { font-size: var(--fz-sm); }
  .meta small { display: block; font-size: var(--fz-xxs); margin-top: 0.2rem; }
  .right { display: flex; align-items: center; gap: 0.75rem; }
  .details { grid-column: 1 / -1; border-top: 1px solid var(--lightest-navy); padding-top: 0.9rem; }

  @media (max-width: 600px) {
    grid-template-columns: 32px 1fr;
    .right { grid-column: 1 / -1; justify-content: space-between; }
  }
`;

export const Score = styled.div`
  min-width: 120px;
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  .bar { height: 6px; background: var(--lightest-navy); border-radius: 3px; overflow: hidden; margin-top: 0.3rem; }
  .bar > i { display: block; height: 100%; background: var(--green); border-radius: 3px; }
  b { color: var(--lightest-slate); font-size: var(--fz-md); }
`;

export const Badge = styled.span`
  font-family: var(--font-mono);
  font-size: var(--fz-xxs);
  padding: 0.15rem 0.45rem;
  border-radius: 3px;
  background: ${({ $tone }) => ($tone === 'down' ? 'var(--loss-bg)' : $tone === 'new' ? 'rgba(204,214,246,0.1)' : 'var(--gain-bg)')};
  color: ${({ $tone }) => ($tone === 'down' ? 'var(--loss)' : $tone === 'new' ? 'var(--lightest-slate)' : 'var(--gain)')};
`;

export const ComponentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.9rem;
`;

export const Headlines = styled.ul`
  list-style: none;
  font-size: var(--fz-xs);
  display: grid;
  gap: 0.35rem;
  a { color: var(--light-slate); text-decoration: none; &:hover { color: var(--green); } }
`;
