import * as XLSX from 'xlsx';
import type { GroupByMode, SortDirection, SortField, Student, StudentGroup } from '../types/student';

export const HEADER_LINE = 'NIS;NISN;Nama Lengkap;L/P;Tempat Lahir;Tanggal Lahir;Kelas';

export function isNisnMissing(nisn: string | undefined | null): boolean {
  const val = String(nisn ?? '').trim();
  return !val || val.toLowerCase() === 'nan' || val === '-';
}

export function cleanNisn(nisn: string | undefined | null): string {
  const val = String(nisn ?? '').trim();
  if (!val || val.toLowerCase() === 'nan') return '';
  return val;
}

export function studentToSemiRow(s: Student): string {
  return [
    s.nis || '',
    cleanNisn(s.nisn),
    s.nama || '',
    s.jk || '',
    s.tempat_lahir || '',
    s.tanggal_lahir || '',
    s.kelas || '',
  ].join(';');
}

export function buildSemiBlock(list: Student[], includeHeader = true): string {
  const rows = list.map(studentToSemiRow);
  return includeHeader ? [HEADER_LINE, ...rows].join('\n') : rows.join('\n');
}

export function sortStudents(
  list: Student[],
  field: SortField,
  direction: SortDirection
): Student[] {
  if (field === 'default') return list;

  const mult = direction === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => {
    const valA = field === 'nisn' ? cleanNisn(a.nisn) : String(a[field] ?? '');
    const valB = field === 'nisn' ? cleanNisn(b.nisn) : String(b[field] ?? '');
    return valA.localeCompare(valB, 'id', { numeric: true }) * mult;
  });
}

export function groupStudents(list: Student[], mode: GroupByMode): StudentGroup[] {
  if (mode === 'none') {
    return [{ key: 'ALL', label: 'Semua Peserta Didik (Terfilter)', items: list }];
  }

  const map = new Map<string, StudentGroup>();

  for (const s of list) {
    let key = '';
    let label = '';

    if (mode === 'kelas') {
      key = s.kelas || 'Tanpa Kelas';
      label = `Kelompok Kelas: ${key}`;
    } else if (mode === 'jk') {
      key = s.jk || 'Tidak Diketahui';
      label =
        s.jk === 'L'
          ? 'Kelompok Jenis Kelamin: Laki-laki (L)'
          : s.jk === 'P'
            ? 'Kelompok Jenis Kelamin: Perempuan (P)'
            : `Kelompok Jenis Kelamin: ${key}`;
    } else if (mode === 'kelas_jk') {
      key = `${s.kelas || 'Tanpa Kelas'} — ${s.jk || '-'}`;
      const jkText =
        s.jk === 'L' ? 'Laki-laki (L)' : s.jk === 'P' ? 'Perempuan (P)' : s.jk || '-';
      label = `${s.kelas || 'Tanpa Kelas'} · ${jkText}`;
    } else if (mode === 'agama') {
      key = s.agama || 'Tidak Tercatat';
      label = `Kelompok Agama: ${key}`;
    }

    if (!map.has(key)) {
      map.set(key, { key, label, items: [] });
    }
    map.get(key)!.items.push(s);
  }

  const groups = [...map.values()];
  groups.sort((a, b) => a.key.localeCompare(b.key, 'id', { numeric: true }));
  return groups;
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fallback to execCommand below
    }
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

export function downloadTextFile(content: string, filename: string, mimeType: string): void {
  const bom = mimeType.includes('csv') ? '\uFEFF' : '';
  const blob = new Blob([bom + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportStudentsToXlsx(students: Student[], filename = 'Data_Siswa_SMPN7_Sentani.xlsx'): void {
  const rows = students.map((s, i) => ({
    No: i + 1,
    NIS: s.nis,
    NISN: cleanNisn(s.nisn),
    'Nama Lengkap': s.nama,
    'L/P': s.jk,
    'Tempat Lahir': s.tempat_lahir,
    'Tanggal Lahir': s.tanggal_lahir,
    Kelas: s.kelas,
    Agama: s.agama,
    Kecamatan: s.kecamatan,
    Format_TitikKoma: studentToSemiRow(s),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data_Siswa');
  XLSX.writeFile(wb, filename);
}

export async function parseStudentFile(file: File): Promise<Student[]> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'csv' || ext === 'txt') {
    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const parsed: Student[] = [];
    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(';').map((p) => p.trim());
      if (i === 0 && parts[0]?.toUpperCase() === 'NIS' && parts[1]?.toUpperCase() === 'NISN') {
        continue;
      }
      if (parts.length >= 3) {
        parsed.push({
          nis: parts[0] || '',
          nisn: cleanNisn(parts[1]),
          nama: parts[2] || '',
          jk: parts[3] || '',
          tempat_lahir: parts[4] || '',
          tanggal_lahir: parts[5] || '',
          kelas: parts[6] || '',
          agama: parts[7] || '',
          kecamatan: parts[8] || '',
        });
      }
    }

    if (!parsed.length) {
      throw new Error('Berkas CSV kosong atau pemisah titik koma (;) tidak sesuai format.');
    }
    return parsed;
  }

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  const firstSheet = wb.Sheets[wb.SheetNames[0]];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1, defval: '' });

  // Detect Dapodik export structure (row index 4 contains 'Nama')
  const isDapodik =
    Array.isArray(matrix[4]) &&
    String(matrix[4][1] ?? '')
      .trim()
      .toLowerCase() === 'nama';

  const parsed: Student[] = [];

  if (isDapodik) {
    for (let r = 6; r < matrix.length; r++) {
      const row = matrix[r] || [];
      const nama = String(row[1] ?? '').trim();
      if (!nama) continue;
      parsed.push({
        nis: String(row[2] ?? '').trim(),
        nisn: cleanNisn(String(row[4] ?? '')),
        nama,
        jk: String(row[3] ?? '').trim(),
        tempat_lahir: String(row[5] ?? '').trim(),
        tanggal_lahir: String(row[6] ?? '').trim(),
        kelas: String(row[42] ?? '').trim(),
        agama: String(row[8] ?? '').trim(),
        kecamatan: String(row[14] ?? '').trim(),
      });
    }
  } else {
    for (let r = 1; r < matrix.length; r++) {
      const row = matrix[r] || [];
      const nama = String(row[2] || row[1] || '').trim();
      if (!nama) continue;
      parsed.push({
        nis: String(row[0] ?? '').trim(),
        nisn: cleanNisn(String(row[1] ?? '')),
        nama,
        jk: String(row[3] ?? '').trim(),
        tempat_lahir: String(row[4] ?? '').trim(),
        tanggal_lahir: String(row[5] ?? '').trim(),
        kelas: String(row[6] ?? '').trim(),
        agama: String(row[7] ?? '').trim(),
        kecamatan: String(row[8] ?? '').trim(),
      });
    }
  }

  if (!parsed.length) {
    throw new Error('Tidak ada baris data peserta didik ditemukan pada berkas.');
  }

  return parsed;
}
