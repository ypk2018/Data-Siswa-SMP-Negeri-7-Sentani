import React from 'react';
import {
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import type { GroupByMode, ViewMode } from '../types/student';

interface ControlPanelProps {
  groupBy: GroupByMode;
  onGroupByChange: (mode: GroupByMode) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filterKelas: string;
  onFilterKelasChange: (val: string) => void;
  kelasOptions: string[];
  filterJk: string;
  onFilterJkChange: (val: string) => void;
  filterAgama: string;
  onFilterAgamaChange: (val: string) => void;
  agamaOptions: string[];
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  showExtraCols: boolean;
  onToggleExtraCols: () => void;
  onlyMissingNisn: boolean;
  onToggleMissingNisn: () => void;
  isCustomDataset: boolean;
  onCopyAllSemi: () => void;
  onDownloadCsv: () => void;
  onDownloadXlsx: () => void;
  onPrint: () => void;
  onClearFilters: () => void;
  onResetDataset: () => void;
  toast: { message: string; isError: boolean } | null;
}

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: 'both', label: 'Tabel + Format (;)' },
  { value: 'table', label: 'Hanya Tabel' },
  { value: 'semicolon', label: 'Hanya Format (;)' },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  groupBy,
  onGroupByChange,
  viewMode,
  onViewModeChange,
  filterKelas,
  onFilterKelasChange,
  kelasOptions,
  filterJk,
  onFilterJkChange,
  filterAgama,
  onFilterAgamaChange,
  agamaOptions,
  searchQuery,
  onSearchQueryChange,
  showExtraCols,
  onToggleExtraCols,
  onlyMissingNisn,
  onToggleMissingNisn,
  isCustomDataset,
  onCopyAllSemi,
  onDownloadCsv,
  onDownloadXlsx,
  onPrint,
  onClearFilters,
  onResetDataset,
  toast,
}) => {
  return (
    <section
      id="kontrol"
      aria-label="Panel Pengelompokan, Filter dan Ekspor"
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5 no-print"
    >
      {/* Panel Header + View Mode Segmented Control */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Pengelompokan, Filter &amp; Mode Tampilan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur pengelompokan otomatis lalu pilih tampilan Tabel, Format Titik Koma (;), atau gabungan keduanya.
          </p>
        </div>

        <div
          role="group"
          aria-label="Mode tampilan data"
          className="inline-flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 self-start md:self-auto"
        >
          {VIEW_MODES.map((m) => {
            const active = viewMode === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => onViewModeChange(m.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                  active
                    ? 'bg-blue-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div>
          <label
            htmlFor="groupBySelect"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Kelompokkan Berdasarkan
          </label>
          <select
            id="groupBySelect"
            value={groupBy}
            onChange={(e) => onGroupByChange(e.target.value as GroupByMode)}
            className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20"
          >
            <option value="kelas">Kelas (Rombel)</option>
            <option value="jk">Jenis Kelamin (L / P)</option>
            <option value="kelas_jk">Kelas + Jenis Kelamin</option>
            <option value="agama">Agama</option>
            <option value="none">Tanpa Kelompok (Daftar Tunggal)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="filterKelas"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Filter Kelas
          </label>
          <select
            id="filterKelas"
            value={filterKelas}
            onChange={(e) => onFilterKelasChange(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20"
          >
            <option value="ALL">Semua Kelas</option>
            {kelasOptions.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filterJk"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Filter Jenis Kelamin
          </label>
          <select
            id="filterJk"
            value={filterJk}
            onChange={(e) => onFilterJkChange(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20"
          >
            <option value="ALL">Semua (L &amp; P)</option>
            <option value="L">Laki-laki (L)</option>
            <option value="P">Perempuan (P)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="filterAgama"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Filter Agama
          </label>
          <select
            id="filterAgama"
            value={filterAgama}
            onChange={(e) => onFilterAgamaChange(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20"
          >
            <option value="ALL">Semua Agama</option>
            {agamaOptions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="searchInput"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Cari Nama / NIS / NISN
          </label>
          <div className="relative">
            <Search
              className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="searchInput"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Ketik nama, NIS, atau NISN..."
              className="w-full h-10 rounded-lg border border-slate-300 bg-white pl-8 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchQueryChange('')}
                aria-label="Hapus pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Display Options & Quick Toggles */}
      <div className="flex flex-wrap items-center gap-5 text-xs text-slate-700">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showExtraCols}
            onChange={onToggleExtraCols}
            className="rounded border-slate-300 text-blue-900 focus:ring-blue-800"
          />
          <span>Tampilkan kolom Agama &amp; Kecamatan di tabel</span>
        </label>

        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyMissingNisn}
            onChange={onToggleMissingNisn}
            className="rounded border-slate-300 text-amber-700 focus:ring-amber-600"
          />
          <span>Hanya tampilkan siswa dengan NISN kosong</span>
        </label>
      </div>

      {/* Export & Utility Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pt-4 border-t border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCopyAllSemi}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-950 hover:bg-blue-900 text-white text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Salin Semua Format (;)</span>
          </button>

          <button
            type="button"
            onClick={onDownloadCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Unduh CSV (;)</span>
          </button>

          <button
            type="button"
            onClick={onDownloadXlsx}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Unduh Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Cetak / PDF</span>
          </button>

          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <span>Reset Filter</span>
          </button>

          {isCustomDataset && (
            <button
              type="button"
              onClick={onResetDataset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Data Awal</span>
            </button>
          )}
        </div>

        {toast && (
          <div
            role="status"
            aria-live="polite"
            className={`text-xs font-semibold whitespace-nowrap ${
              toast.isError ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </section>
  );
};
