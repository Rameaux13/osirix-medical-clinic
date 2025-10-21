'use client';

import { useState } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import RdvEnAttenteList from '../components/RdvEnAttenteList';
import FilterBar from '../components/FilterBar';

export default function RdvEnAttentePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCountChange = (count: number) => {
    setPendingCount(count);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Contenu principal */}
      <div className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <div className="bg-orange-50 p-2 sm:p-3 rounded-xl border border-orange-200 flex-shrink-0">
              <Clock className="text-orange-600" size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 truncate">
                Rendez-vous en attente
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-1">
                {pendingCount > 0
                  ? `${pendingCount} RDV à valider`
                  : 'Tous les RDV sont à jour'
                }
              </p>
            </div>
          </div>

          {/* Bouton Actualiser */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-[#006D65] hover:bg-[#005a5a] disabled:bg-[#006D65]/70 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-[#006D65]/50 text-sm sm:text-base w-full sm:w-auto"
            aria-label="Actualiser la liste des rendez-vous"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Barre de filtres - ✅ CORRIGÉ */}
        <FilterBar
          onSearchChange={setSearchFilter}
          showStatusFilter={false}
          placeholder="Rechercher un patient par nom, email ou téléphone..."
        />

        {/* Liste des RDV en attente */}
        <div className={isRefreshing ? 'opacity-75 transition-opacity duration-300' : 'transition-opacity duration-300'}>
          <RdvEnAttenteList 
            onRefresh={handleRefresh}
            searchFilter={searchFilter}
            onCountChange={handleCountChange}
            refreshTrigger={refreshKey}
          />
        </div>
      </div>

      {/* Footer OSIRIX */}
      <div className="text-center space-y-2 mt-8 py-4 sm:py-6 border-t border-gray-200 bg-white">
        <p className="text-xs sm:text-sm text-gray-600 px-4">
          © 2025 <span className="font-semibold text-[#006D65]">OSIRIX</span> - Tous droits réservés
        </p>
      </div>
    </div>
  );
}