export interface Student {
  nis: string;
  nisn: string;
  nama: string;
  jk: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  kelas: string;
  agama: string;
  kecamatan: string;
}

export type GroupByMode = 'kelas' | 'jk' | 'kelas_jk' | 'agama' | 'none';

export type ViewMode = 'both' | 'table' | 'semicolon';

export type SortField =
  | 'default'
  | 'nis'
  | 'nisn'
  | 'nama'
  | 'jk'
  | 'tempat_lahir'
  | 'tanggal_lahir'
  | 'kelas';

export type SortDirection = 'asc' | 'desc';

export interface StudentGroup {
  key: string;
  label: string;
  items: Student[];
}
