'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  selectedMonth: number;
  selectedYear: number;
  onChange: (month: number, year: number) => void;
  label?: string;
};

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function MonthYearFilter({ selectedMonth, selectedYear, onChange, label }: Props) {
  const now = new Date();

  const prevMonth = () => {
    if (selectedMonth === 0) {
      onChange(11, selectedYear - 1);
    } else {
      onChange(selectedMonth - 1, selectedYear);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      onChange(0, selectedYear + 1);
    } else {
      onChange(selectedMonth + 1, selectedYear);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      {label && <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>}
      <button onClick={prevMonth} className="btn-icon" title="Mes anterior"><ChevronLeft size={15} /></button>
      <select value={selectedMonth} onChange={e => onChange(parseInt(e.target.value), selectedYear)}
        style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: '#fff', color: 'var(--text)', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
        {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
      </select>
      <select value={selectedYear} onChange={e => onChange(selectedMonth, parseInt(e.target.value))}
        style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: '#fff', color: 'var(--text)', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
        {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <button onClick={nextMonth} className="btn-icon" title="Mes siguiente"><ChevronRight size={15} /></button>
      <button onClick={() => onChange(now.getMonth(), now.getFullYear())} className="btn-ghost btn-sm" style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--primary)' }}>
        Hoy
      </button>
    </div>
  );
}

export function monthYearFilter<T extends { createdAt?: number }>(data: T[], month: number, year: number): T[] {
  const start = new Date(year, month, 1).getTime();
  const end = new Date(year, month + 1, 1).getTime();
  return data.filter(item => item.createdAt && item.createdAt >= start && item.createdAt < end);
}
