'use client';

import { useState, useEffect, useMemo } from 'react';
import { Mail, Phone, Calendar, Send, Search, ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';
import { secretaryService, type Patient } from '@/services/secretaryService';
import { useRouter } from 'next/navigation';

interface PatientsListProps {
  searchTerm?: string;
  onSendAnalysis?: (patientId: string) => void;  // ✅ CORRIGÉ : string au lieu de number
  onPatientCount?: (count: number) => void;
}

const PatientsList = ({ searchTerm, onSendAnalysis, onPatientCount }: PatientsListProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const router = useRouter();

  const itemsPerPage = 12;

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await secretaryService.getPatientsList(searchTerm);
      setPatients(data);

      if (onPatientCount) {
        onPatientCount(data.length);
      }

      setCurrentPage(1);
    } catch (error) {
      alert('Erreur lors du chargement des patients. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchTerm]);

  const paginatedPatients = useMemo(() => {
    const totalPages = Math.ceil(patients.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      currentPatients: patients.slice(startIndex, endIndex),
      totalPages,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, patients.length),
    };
  }, [patients, currentPage]);

  const handleSendAnalysis = (patientId: string) => {  // ✅ CORRIGÉ : string au lieu de number
    if (onSendAnalysis) {
      onSendAnalysis(patientId);
    } else {
      router.push(`/staff/dashboard/secretary/envoyer-analyse?patientId=${patientId}`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="flex justify-center mb-4">
                <div className="bg-gray-300 rounded-full w-20 h-20"></div>
              </div>
              <div className="space-y-3">
                <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </div>
                <div className="h-12 bg-gray-300 rounded-xl mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
        <Search className="mx-auto text-gray-400 mb-4" size={80} />
        <p className="text-gray-700 text-xl font-semibold">Aucun patient trouvé</p>
        {searchTerm && (
          <p className="text-gray-500 text-base mt-2">
            Aucun résultat pour &quot;{searchTerm}&quot;. Essayez un autre terme.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec toggle */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          Liste des patients ({patients.length})
        </h2>

        <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 md:p-3 rounded-lg transition-all ${viewMode === 'grid'
                ? 'bg-gradient-to-r from-[#006D65] to-[#E6A930] text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            aria-label="Vue grille"
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 md:p-3 rounded-lg transition-all ${viewMode === 'list'
                ? 'bg-gradient-to-r from-[#006D65] to-[#E6A930] text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            aria-label="Vue liste"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Vue Grille */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {paginatedPatients.currentPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white border-2 border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-xl hover:border-[#E6A930] transition-all duration-300"
            >
              <div className="flex flex-col items-center mb-5">
                <div className="bg-gradient-to-br from-[#006D65] via-[#008577] to-[#E6A930] text-white rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center font-bold text-2xl md:text-3xl mb-4 shadow-lg">
                  {patient.firstName?.[0]?.toUpperCase() || 'P'}
                  {patient.lastName?.[0]?.toUpperCase() || 'P'}
                </div>
                <h3 className="font-bold text-lg md:text-xl text-gray-900 text-center leading-tight">
                  {patient.firstName} {patient.lastName}
                </h3>
              </div>

              <div className="space-y-3 md:space-y-4 mb-5">
                <div className="flex items-start gap-3 text-sm md:text-base text-gray-700">
                  <Mail size={18} className="text-[#E6A930] flex-shrink-0 mt-0.5" />
                  <span className="truncate font-medium">{patient.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm md:text-base text-gray-700">
                  <Phone size={18} className="text-[#E6A930] flex-shrink-0" />
                  <span className="font-medium">{patient.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm md:text-base text-gray-700">
                  <Calendar size={18} className="text-[#006D65] flex-shrink-0" />
                  <span className="font-medium">
                    Inscrit le {new Date(patient.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              {patient.appointmentsCount !== undefined && patient.appointmentsCount > 0 && (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm md:text-base font-semibold border-2 border-blue-200 shadow-sm">
                    <Calendar size={16} />
                    {patient.appointmentsCount} RDV
                  </span>
                </div>
              )}

              <button
                onClick={() => handleSendAnalysis(patient.id)}
                className="w-full bg-gradient-to-r from-[#006D65] via-[#008577] to-[#E6A930] hover:from-[#005a5a] hover:via-[#006D65] hover:to-[#cc9428] text-white py-3.5 md:py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 font-bold text-base md:text-lg shadow-md hover:shadow-xl"
              >
                <Send size={20} />
                Envoyer analyse
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <div className="space-y-3 md:space-y-4">
          {paginatedPatients.currentPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white border-2 border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-lg hover:border-[#E6A930] transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <div className="bg-gradient-to-br from-[#006D65] via-[#008577] to-[#E6A930] text-white rounded-full w-16 h-16 md:w-14 md:h-14 flex items-center justify-center font-bold text-xl md:text-lg flex-shrink-0 shadow-md">
                {patient.firstName?.[0]?.toUpperCase() || 'P'}
                {patient.lastName?.[0]?.toUpperCase() || 'P'}
              </div>

              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-2">
                  {patient.firstName} {patient.lastName}
                </h3>
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-sm md:text-base text-gray-700">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-[#E6A930] flex-shrink-0" />
                    <span className="truncate font-medium">{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-[#E6A930] flex-shrink-0" />
                    <span className="font-medium">{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#006D65] flex-shrink-0" />
                    <span className="font-medium">
                      {new Date(patient.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {patient.appointmentsCount !== undefined && patient.appointmentsCount > 0 && (
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 px-3 py-2 rounded-full text-sm md:text-base font-semibold border-2 border-blue-200 shadow-sm">
                    <Calendar size={14} />
                    {patient.appointmentsCount} RDV
                  </span>
                )}

                <button
                  onClick={() => handleSendAnalysis(patient.id)}
                  className="flex-1 sm:flex-initial bg-gradient-to-r from-[#006D65] via-[#008577] to-[#E6A930] hover:from-[#005a5a] hover:via-[#006D65] hover:to-[#cc9428] text-white py-2.5 md:py-3 px-4 md:px-5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 font-bold text-sm md:text-base shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  <Send size={18} />
                  Envoyer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {paginatedPatients.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 md:p-3 rounded-xl border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="flex items-center gap-1 md:gap-2">
            {Array.from({ length: paginatedPatients.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl font-bold text-base md:text-lg transition-all ${currentPage === page
                    ? 'bg-gradient-to-r from-[#006D65] to-[#E6A930] text-white shadow-lg scale-110'
                    : 'bg-white border-2 border-gray-300 hover:border-[#E6A930] text-gray-700 hover:shadow-md'
                  }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === paginatedPatients.totalPages}
            className="p-2 md:p-3 rounded-xl border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}

      <div className="text-center text-base md:text-lg font-semibold text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
        Affichage de {paginatedPatients.startIndex} à {paginatedPatients.endIndex} sur {patients.length} patients
      </div>
    </div>
  );
};

export default PatientsList;