import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Copy, Download } from 'lucide-react';
import type { SortDirection, SortField, StudentGroup, ViewMode } from '../types/student';
import { buildSemiBlock, cleanNisn, isNisnMissing } from '../utils/studentUtils';

interface StudentGroupCardProps {
  group: StudentGroup;
  index: number;
  viewMode: ViewMode;
  showExtraCols: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  onCopyGroup: (group: StudentGroup) => void;
  onDownloadGroupCsv: (group: StudentGroup) => void;
}

export const StudentGroupCard: React.FC<StudentGroupCardProps> = ({
  group,
  index,
  viewMode,
  showExtraCols,
  sortField,
  sortDirection,
  onSortChange,
  onCopyGroup,
  onDownloadGroupCsv,
}) => {
  const lCount = group.items.filter((x) => x.jk === 'L').length;
  const pCount = group.items.filter((x) => x.jk === 'P').length;
  const semiText = buildSemiBlock(group.items, true);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-45" aria-hidden="true" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-200" aria-hidden="true" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-200" aria-hidden="true" />
    );
  };

  const renderSortableTh = (
    field: SortField,
    label: string,
    align: 'left' | 'center' = 'left'
  ) => (
    <th
      scope="col"
      className={`py-2.5 px-3 font-semibold text-xs tracking-wide whitespace-nowrap ${
        align === 'center' ? 'text-center' : 'text-left'
      }`}
    >
      <button
        type="button"
        onClick={() => onSortChange(field)}
        className={`inline-flex items-center gap-1.5 hover:text-blue-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline ${
          align === 'center' ? 'justify-center' : ''
        }`}
      >
        <span>{label}</span>
        <span className="no-print">{renderSortIcon(field)}</span>
      </button>
    </th>
  );

  return (
    <article className={`${index > 0 ? 'print-break pt-6 border-t border-slate-200' : ''} space-y-4`}>
      {/* Group Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <div>
          <h3 className="text-base font-bold text-slate-950">{group.label}</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-0.5 tabular-nums">
            <span>
              Jumlah: <strong className="text-slate-900">{group.items.length}</strong> siswa
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Laki-laki (L): <strong className="text-blue-900">{lCount}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Perempuan (P): <strong className="text-indigo-800">{pCount}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 no-print shrink-0">
          <button
            type="button"
            onClick={() => onCopyGroup(group)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-white text-xs font-semibold transition-colors duration-150 whitespace-nowrap cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Salin (;) Kelompok</span>
          </button>
          <button
            type="button"
            onClick={() => onDownloadGroupCsv(group)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors duration-150 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Unduh CSV (;)</span>
          </button>
        </div>
      </div>

      {/* Table View */}
      {(viewMode === 'both' || viewMode === 'table') && (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-blue-950 text-white">
                <th scope="col" className="py-2.5 px-3 font-semibold text-center w-12">
                  No
                </th>
                {renderSortableTh('nis', 'NIS')}
                {renderSortableTh('nisn', 'NISN')}
                {renderSortableTh('nama', 'Nama Lengkap')}
                {renderSortableTh('jk', 'L/P', 'center')}
                {renderSortableTh('tempat_lahir', 'Tempat Lahir')}
                {renderSortableTh('tanggal_lahir', 'Tanggal Lahir', 'center')}
                {renderSortableTh('kelas', 'Kelas', 'center')}
                {showExtraCols && (
                  <>
                    <th scope="col" className="py-2.5 px-3 font-semibold whitespace-nowrap">
                      Agama
                    </th>
                    <th scope="col" className="py-2.5 px-3 font-semibold whitespace-nowrap">
                      Kecamatan
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {group.items.map((s, i) => {
                const missingNisn = isNisnMissing(s.nisn);
                const formattedNisn = cleanNisn(s.nisn);
                return (
                  <tr
                    key={`${s.nis}-${s.nama}-${i}`}
                    className={`${
                      i % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                    } hover:bg-blue-50/50 transition-colors duration-100`}
                  >
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono tabular-nums">
                      {i + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-800 whitespace-nowrap">
                      {s.nis}
                    </td>
                    <td
                      className={`py-2.5 px-3 font-mono tabular-nums whitespace-nowrap ${
                        missingNisn ? 'text-amber-700 font-semibold' : 'text-slate-800'
                      }`}
                    >
                      {missingNisn ? '(Kosong)' : formattedNisn}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {s.nama}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-center font-bold tabular-nums ${
                        s.jk === 'L' ? 'text-blue-900' : 'text-indigo-800'
                      }`}
                    >
                      {s.jk}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{s.tempat_lahir}</td>
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      {s.tanggal_lahir}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-900 whitespace-nowrap">
                      {s.kelas}
                    </td>
                    {showExtraCols && (
                      <>
                        <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                          {s.agama || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                          {s.kecamatan || '-'}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Semicolon Format Block */}
      {(viewMode === 'both' || viewMode === 'semicolon') && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-semibold text-slate-700">
              Format Titik Koma (;) — {group.label} ({group.items.length} baris data + 1 header)
            </span>
            <button
              type="button"
              onClick={() => onCopyGroup(group)}
              className="no-print inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <Copy className="w-3 h-3" aria-hidden="true" />
              <span>Salin Blok (;)</span>
            </button>
          </div>
          <pre className="font-mono text-[11px] leading-relaxed bg-slate-950 text-emerald-300 rounded-lg p-3.5 overflow-x-auto max-h-60 border border-slate-800 tabular-nums">
            {semiText}
          </pre>
        </div>
      )}
    </article>
  );
};
