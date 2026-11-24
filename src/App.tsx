import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import initialStudentsRaw from './data/initialStudents.json';
import type {
  GroupByMode,
  SortDirection,
  SortField,
  Student,
  StudentGroup,
  ViewMode,
} from './types/student';
import {
  HEADER_LINE,
  buildSemiBlock,
  cleanNisn,
  copyToClipboard,
  downloadTextFile,
  exportStudentsToXlsx,
  groupStudents,
  isNisnMissing,
  parseStudentFile,
  sortStudents,
} from './utils/studentUtils';
import { TopHeader } from './components/TopHeader';
import { KpiSummaryStrip } from './components/KpiSummaryStrip';
import { ControlPanel } from './components/ControlPanel';
import { StudentGroupCard } from './components/StudentGroupCard';

const INITIAL_STUDENTS = initialStudentsRaw as Student[];

export default function App() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [datasetSource, setDatasetSource] = useState<string>('Dapodik (24 Nov 2026)');
  const [isCustomDataset, setIsCustomDataset] = useState<boolean>(false);

  const [groupBy, setGroupBy] = useState<GroupByMode>('kelas');
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [filterKelas, setFilterKelas] = useState<string>('ALL');
  const [filterJk, setFilterJk] = useState<string>('ALL');
  const [filterAgama, setFilterAgama] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyMissingNisn, setOnlyMissingNisn] = useState<boolean>(false);
  const [showExtraCols, setShowExtraCols] = useState<boolean>(false);

  const [sortField, setSortField] = useState<SortField>('default');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, isError });
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const kelasOptions = useMemo(() => {
    return [...new Set(students.map((s) => s.kelas).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'id', { numeric: true })
    );
  }, [students]);

  const agamaOptions = useMemo(() => {
    return [...new Set(students.map((s) => s.agama).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'id')
    );
  }, [students]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = students.filter((s) => {
      if (filterKelas !== 'ALL' && s.kelas !== filterKelas) return false;
      if (filterJk !== 'ALL' && s.jk !== filterJk) return false;
      if (filterAgama !== 'ALL' && s.agama !== filterAgama) return false;
      if (onlyMissingNisn && !isNisnMissing(s.nisn)) return false;
      if (q) {
        const haystack = `${s.nis} ${cleanNisn(s.nisn)} ${s.nama} ${s.tempat_lahir} ${s.kelas}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return sortStudents(filtered, sortField, sortDirection);
  }, [
    students,
    filterKelas,
    filterJk,
    filterAgama,
    onlyMissingNisn,
    searchQuery,
    sortField,
    sortDirection,
  ]);

  const groups = useMemo(() => {
    return groupStudents(filteredStudents, groupBy);
  }, [filteredStudents, groupBy]);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField('default');
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFileSelected = async (file: File) => {
    try {
      const parsed = await parseStudentFile(file);
      setStudents(parsed);
      setDatasetSource(file.name);
      setIsCustomDataset(true);
      setFilterKelas('ALL');
      setFilterJk('ALL');
      setFilterAgama('ALL');
      setOnlyMissingNisn(false);
      setSearchQuery('');
      setSortField('default');
      showToast(`Berhasil memuat ${parsed.length} data siswa dari ${file.name}.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Format berkas tidak dikenali.';
      showToast(`Gagal membaca berkas: ${msg}`, true);
    }
  };

  const handleResetDataset = () => {
    setStudents(INITIAL_STUDENTS);
    setDatasetSource('Dapodik (24 Nov 2026)');
    setIsCustomDataset(false);
    setFilterKelas('ALL');
    setFilterJk('ALL');
    setFilterAgama('ALL');
    setOnlyMissingNisn(false);
    setSearchQuery('');
    setSortField('default');
    showToast('Data dikembalikan ke daftar awal 250 siswa SMP Negeri 7 Sentani.');
  };

  const handleClearFilters = () => {
    setFilterKelas('ALL');
    setFilterJk('ALL');
    setFilterAgama('ALL');
    setOnlyMissingNisn(false);
    setSearchQuery('');
    setGroupBy('kelas');
    setSortField('default');
    showToast('Filter dikembalikan ke pengaturan awal.');
  };

  const handleCopyAllSemi = async () => {
    if (!filteredStudents.length) {
      showToast('Tidak ada data untuk disalin.', true);
      return;
    }
    await copyToClipboard(buildSemiBlock(filteredStudents, true));
    showToast(`Tersalin ${filteredStudents.length} baris format (;) ke clipboard.`);
  };

  const handleDownloadCsv = () => {
    if (!filteredStudents.length) {
      showToast('Tidak ada data untuk diunduh.', true);
      return;
    }
    downloadTextFile(
      buildSemiBlock(filteredStudents, true),
      'Data_Siswa_SMPN7_Sentani.csv',
      'text/csv;charset=utf-8;'
    );
    showToast(`CSV (${filteredStudents.length} siswa) berhasil diunduh.`);
  };

  const handleDownloadXlsx = () => {
    if (!filteredStudents.length) {
      showToast('Tidak ada data untuk diunduh.', true);
      return;
    }
    exportStudentsToXlsx(filteredStudents);
    showToast('Berkas Excel (.xlsx) berhasil diunduh.');
  };

  const handleCopyGroup = async (group: StudentGroup) => {
    await copyToClipboard(buildSemiBlock(group.items, true));
    showToast(`Tersalin: format (;) ${group.label}`);
  };

  const handleDownloadGroupCsv = (group: StudentGroup) => {
    const safeName = group.key.replace(/[^a-zA-Z0-9_-]+/g, '_');
    downloadTextFile(
      buildSemiBlock(group.items, true),
      `SMPN7_${safeName}.csv`,
      'text/csv;charset=utf-8;'
    );
    showToast(`CSV diunduh: SMPN7_${safeName}.csv`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopHeader onFileSelected={handleFileSelected} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Heading & Institutional Context */}
        <section id="ringkasan" className="space-y-2 no-print">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span>Sumber: {datasetSource}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{students.length.toLocaleString('id-ID')} Peserta Didik Termuat</span>
            <span aria-hidden="true">·</span>
            <span>Distrik Sentani, Kabupaten Jayapura</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 text-balance max-w-3xl">
            Portal Sortir &amp; Format Data Peserta Didik
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Kelompokkan data peserta didik berdasarkan Kelas, Jenis Kelamin (L/P), atau Agama — tampilkan dalam Tabel terstruktur maupun Format Titik Koma (;) siap salin dan ekspor.
          </p>
        </section>

        {/* Summary KPI Strip */}
        <KpiSummaryStrip
          filteredStudents={filteredStudents}
          onlyMissingNisn={onlyMissingNisn}
          onToggleMissingNisn={() => setOnlyMissingNisn((prev) => !prev)}
        />

        {/* Control Panel */}
        <ControlPanel
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filterKelas={filterKelas}
          onFilterKelasChange={setFilterKelas}
          kelasOptions={kelasOptions}
          filterJk={filterJk}
          onFilterJkChange={setFilterJk}
          filterAgama={filterAgama}
          onFilterAgamaChange={setFilterAgama}
          agamaOptions={agamaOptions}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          showExtraCols={showExtraCols}
          onToggleExtraCols={() => setShowExtraCols((prev) => !prev)}
          onlyMissingNisn={onlyMissingNisn}
          onToggleMissingNisn={() => setOnlyMissingNisn((prev) => !prev)}
          isCustomDataset={isCustomDataset}
          onCopyAllSemi={handleCopyAllSemi}
          onDownloadCsv={handleDownloadCsv}
          onDownloadXlsx={handleDownloadXlsx}
          onPrint={() => window.print()}
          onClearFilters={handleClearFilters}
          onResetDataset={handleResetDataset}
          toast={toast}
        />

        {/* Official Kop Surat & Dynamic Groups Document Workspace */}
        <section
          id="kop-dokumen"
          className="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 space-y-7"
        >
          {/* Official Kop Surat Header */}
          <div className="border-b-4 border-double border-slate-900 pb-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 text-center md:text-left">
              <div>
                <p className="font-serif text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Pemerintah Kabupaten Jayapura · Dinas Pendidikan
                </p>
                <h2 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide text-slate-950 mt-0.5">
                  SMP Negeri 7 Sentani
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Jl. BTN Sosial BPD Gunung, Distrik Sentani, Kabupaten Jayapura, Provinsi Papua · Motto:{' '}
                  <em className="font-serif">Khena Mbai Umbai</em>
                </p>
              </div>

              <div className="text-xs text-slate-600 md:text-right">
                <div className="font-medium text-slate-500">Format Standar Titik Koma (;):</div>
                <div className="font-mono text-[11px] font-medium text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded mt-1 inline-block">
                  {HEADER_LINE}
                </div>
              </div>
            </div>
          </div>

          {/* Groups Output Container */}
          <div id="kelompok" className="space-y-8">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <p className="text-sm font-semibold text-slate-800">
                  Tidak ada data siswa yang cocok dengan filter saat ini.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Ubah kata kunci pencarian atau kembalikan filter untuk menampilkan seluruh peserta didik.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-blue-950 hover:bg-blue-900 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              groups.map((grp, idx) => (
                <StudentGroupCard
                  key={grp.key}
                  group={grp}
                  index={idx}
                  viewMode={viewMode}
                  showExtraCols={showExtraCols}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSortChange={handleSortChange}
                  onCopyGroup={handleCopyGroup}
                  onDownloadGroupCsv={handleDownloadGroupCsv}
                />
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white text-slate-500 text-xs py-5 px-4 text-center no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SMP Negeri 7 Sentani · Portal Data Peserta Didik</span>
          <span>Mendukung Mode Tabel, Cetak Kop Resmi &amp; Format Titik Koma (;)</span>
        </div>
      </footer>
    </div>
  );
}
