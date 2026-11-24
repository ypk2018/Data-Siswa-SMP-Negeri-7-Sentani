import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface TopHeaderProps {
  onFileSelected: (file: File) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onFileSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#ringkasan"
          className="font-serif text-lg font-bold tracking-tight text-blue-950 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded"
        >
          SMP Negeri 7 Sentani
        </a>

        <nav
          aria-label="Navigasi Portal"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <a
            href="#ringkasan"
            className="hover:text-blue-950 transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-blue-900"
          >
            Ringkasan
          </a>
          <a
            href="#kontrol"
            className="hover:text-blue-950 transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-blue-900"
          >
            Panel Kontrol
          </a>
          <a
            href="#kop-dokumen"
            className="hover:text-blue-950 transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-blue-900"
          >
            Kop Dokumen
          </a>
          <a
            href="#kelompok"
            className="hover:text-blue-950 transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-blue-900"
          >
            Data Kelompok
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx,.csv"
            onChange={handleChange}
            className="hidden"
            aria-label="Unggah berkas Excel atau CSV"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-950 hover:bg-blue-900 text-white text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Unggah Berkas (.xls/.csv)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
