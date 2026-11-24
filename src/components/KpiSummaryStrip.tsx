import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Student } from '../types/student';
import { isNisnMissing } from '../utils/studentUtils';

interface KpiSummaryStripProps {
  filteredStudents: Student[];
  onlyMissingNisn: boolean;
  onToggleMissingNisn: () => void;
}

export const KpiSummaryStrip: React.FC<KpiSummaryStripProps> = ({
  filteredStudents,
  onlyMissingNisn,
  onToggleMissingNisn,
}) => {
  const total = filteredStudents.length;
  const lCount = filteredStudents.filter((s) => s.jk === 'L').length;
  const pCount = filteredStudents.filter((s) => s.jk === 'P').length;
  const emptyNisnCount = filteredStudents.filter((s) => isNisnMissing(s.nisn)).length;
  const uniqueKelas = new Set(filteredStudents.map((s) => s.kelas).filter(Boolean)).size;

  const lPct = total ? ((lCount / total) * 100).toFixed(1) : '0.0';
  const pPct = total ? ((pCount / total) * 100).toFixed(1) : '0.0';

  return (
    <section
      aria-label="Ringkasan Statistik Peserta Didik"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden no-print"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        <div className="p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">Total Siswa (Filter)</div>
          <div className="mt-1.5 text-2xl sm:text-3xl font-bold text-slate-950 tabular-nums font-mono">
            {total.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums">
            {uniqueKelas} Rombongan Belajar
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">Laki-laki (L)</div>
          <div className="mt-1.5 text-2xl sm:text-3xl font-bold text-blue-900 tabular-nums font-mono">
            {lCount.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums">{lPct}% dari total</div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">Perempuan (P)</div>
          <div className="mt-1.5 text-2xl sm:text-3xl font-bold text-indigo-800 tabular-nums font-mono">
            {pCount.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums">{pPct}% dari total</div>
        </div>

        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500">NISN Kosong</span>
              {emptyNisnCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                  <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                  <span>Verifikasi</span>
                </span>
              )}
            </div>
            <div className="mt-1.5 text-2xl sm:text-3xl font-bold text-amber-700 tabular-nums font-mono">
              {emptyNisnCount.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="mt-1">
            <button
              type="button"
              onClick={onToggleMissingNisn}
              className={`text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:underline ${
                onlyMissingNisn
                  ? 'text-blue-900 underline'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              {onlyMissingNisn ? 'Tampilkan semua siswa' : 'Filter hanya NISN kosong'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
