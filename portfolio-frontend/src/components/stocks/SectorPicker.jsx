import { useEffect, useState } from 'react';
import { stocksApi } from '../../api/stocksApi';
import { ChipGrid, Chip } from '../../styles/StocksStyles';

// Fallback so the picker still renders if the sectors endpoint is unreachable.
const DEFAULT_SECTORS = [
  'Communication Services', 'Consumer Discretionary', 'Consumer Staples', 'Energy', 'Financials',
  'Health Care', 'Industrials', 'Information Technology', 'Materials', 'Real Estate', 'Utilities',
];

export default function SectorPicker({ value, onChange }) {
  const [sectors, setSectors] = useState(DEFAULT_SECTORS);

  useEffect(() => {
    stocksApi.sectors().then((d) => d?.sectors?.length && setSectors(d.sectors)).catch(() => {});
  }, []);

  const toggle = (s) => onChange(value.includes(s) ? value.filter((x) => x !== s) : [...value, s]);

  return (
    <ChipGrid role="group" aria-label="Industries">
      {sectors.map((s) => (
        <Chip key={s} type="button" $active={value.includes(s)} aria-pressed={value.includes(s)} onClick={() => toggle(s)}>
          {s}
        </Chip>
      ))}
    </ChipGrid>
  );
}
