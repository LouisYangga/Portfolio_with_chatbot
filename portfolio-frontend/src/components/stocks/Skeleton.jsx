import styled, { keyframes } from 'styled-components';
import { SummaryGrid, Stat, TableWrap } from '../../styles/StocksStyles';

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

export const Bone = styled.span`
  display: block;
  height: ${({ $h = 14 }) => $h}px;
  width: ${({ $w = '100%' }) => $w};
  border-radius: 4px;
  background: linear-gradient(90deg, var(--lightest-navy) 0%, rgba(136,146,176,0.25) 50%, var(--lightest-navy) 100%);
  background-size: 800px 100%;
  animation: ${shimmer} 1.4s linear infinite;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr);
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(35, 53, 84, 0.6);
  &:last-child { border-bottom: none; }
`;

export function SummarySkeleton() {
  return (
    <SummaryGrid aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <Stat key={i}>
          <Bone $w="60%" $h={10} />
          <Bone $w="80%" $h={22} style={{ marginTop: 10 }} />
        </Stat>
      ))}
    </SummaryGrid>
  );
}

export function TableSkeleton({ rows = 3 }) {
  return (
    <TableWrap aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <Row key={i}>
          <Bone $w="70%" />
          <Bone /><Bone /><Bone /><Bone />
        </Row>
      ))}
    </TableWrap>
  );
}

/** Full-page placeholder shown while the session is being checked. */
export function PageSkeleton() {
  return (
    <div aria-label="Loading">
      <Bone $w="120px" $h={12} />
      <Bone $w="220px" $h={34} style={{ margin: '12px 0 8px' }} />
      <Bone $w="280px" $h={14} style={{ marginBottom: 40 }} />
      <SummarySkeleton />
      <TableSkeleton />
    </div>
  );
}
