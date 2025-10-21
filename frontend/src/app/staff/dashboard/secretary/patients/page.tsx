'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import PatientsList from '../components/PatientsList';
import FilterBar from '../components/FilterBar';

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPatients, setTotalPatients] = useState(0);

  const handlePatientCountChange = (count: number) => {
    setTotalPatients(count);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Contenu principal */}
      <div className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header avec compteur intégré */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4 flex-1">
            <div className="bg-[#006D65]/10 p-3 rounded-xl border border-[#006D65]/20">
              <Users className="text-[#006D65]" size={32} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Liste des patients
              </h1>
              <p className="text-gray-600 text-sm md:text-base mt-1">
                Gérez vos patients et envoyez-leur des analyses en un clic
              </p>
            </div>
          </div>
          {/* Compteur compact comme badge */}
          <div className="flex items-center gap-2 bg-[#006D65]/10 px-4 py-2 rounded-full border border-[#006D65]/20">
            <Users className="text-[#006D65] text-sm" size={16} />
            <span className="text-sm font-semibold text-[#006D65]">
              Total patients: {totalPatients}
            </span>
          </div>
        </div>

        {/* Barre de recherche */}
        <FilterBar
          onSearchChange={setSearchTerm}
          showStatusFilter={false}
          placeholder="Rechercher un patient par nom, email ou téléphone..."
        />

        {/* Liste des patients */}
        <PatientsList
          searchTerm={searchTerm}
          onPatientCount={handlePatientCountChange}
        />
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