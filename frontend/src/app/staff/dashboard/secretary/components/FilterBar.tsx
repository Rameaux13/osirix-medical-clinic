'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

interface FilterBarProps {
  onSearchChange?: (search: string) => void;
  onStatusChange?: (status: string) => void;
  showStatusFilter?: boolean;
  statusOptions?: { value: string; label: string }[];
  placeholder?: string;
}

const DEFAULT_STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmé' },
  { value: 'cancelled', label: 'Annulé' },
  { value: 'completed', label: 'Terminé' },
];

const FilterBar = ({
  onSearchChange,
  onStatusChange,
  showStatusFilter = true,
  statusOptions = DEFAULT_STATUS_OPTIONS,
  placeholder = 'Rechercher...',
}: FilterBarProps) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange?.(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, onSearchChange]);

  useEffect(() => {
    setHasActiveFilters(search !== '' || status !== '');
  }, [search, status]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  };

  const handleReset = () => {
    setSearch('');
    setStatus('');
    onSearchChange?.('');
    onStatusChange?.('');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        {/* Barre de recherche */}
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent transition-all bg-white text-gray-900 text-sm sm:text-base font-medium placeholder:text-gray-400"
          />
        </div>

        {/* Dropdown Statut - AMÉLIORÉ */}
        {showStatusFilter && (
          <div className="w-full lg:w-64 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={20} />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={20} />
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full pl-10 pr-10 py-3 sm:py-3.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-[#006D65] cursor-pointer transition-all bg-white text-gray-900 font-bold text-sm sm:text-base appearance-none hover:border-[#006D65] shadow-sm"
              style={{
                backgroundImage: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
              }}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value} className="font-bold text-base py-2">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Bouton Réinitialiser */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="w-full lg:w-auto px-4 sm:px-6 py-3 sm:py-3.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg flex items-center justify-center gap-2 transition-all font-semibold text-sm sm:text-base select-none shadow-sm hover:shadow-md"
            aria-label="Réinitialiser les filtres"
          >
            <X size={20} />
            <span>Réinitialiser</span>
          </button>
        )}
      </div>

      {/* Filtres actifs */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 font-medium mr-2 select-none">Filtres actifs :</p>
          {search && (
            <span className="inline-flex items-center gap-1.5 bg-[#006D65] text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold select-none shadow-sm">
              Recherche: "{search}"
              <button
                onClick={() => {
                  setSearch('');
                  onSearchChange?.('');
                }}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                aria-label="Supprimer le filtre recherche"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {status && (
            <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 border border-blue-300 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold select-none shadow-sm">
              Statut: {statusOptions.find((opt) => opt.value === status)?.label}
              <button
                onClick={() => {
                  setStatus('');
                  onStatusChange?.('');
                }}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                aria-label="Supprimer le filtre statut"
              >
                <X size={14} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;