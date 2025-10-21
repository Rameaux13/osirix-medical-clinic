'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, CreditCard, Shield, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { secretaryService, type Appointment } from '@/services/secretaryService';

interface RdvHistoryTableProps {
  filters?: {
    status?: string;
    date?: string;
    patient?: string;
  };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
  CONFIRME: { label: 'Confirmé', color: 'bg-green-100 text-green-800 border border-green-300' },
  ANNULE: { label: 'Annulé', color: 'bg-red-100 text-red-800 border border-red-300' },
  TERMINE: { label: 'Terminé', color: 'bg-blue-100 text-blue-800 border border-blue-300' },
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
  confirmed: { label: 'Confirmé', color: 'bg-green-100 text-green-800 border border-green-300' },
  CONFIRMED: { label: 'Confirmé', color: 'bg-green-100 text-green-800 border border-green-300' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800 border border-red-300' },
  CANCELLED: { label: 'Annulé', color: 'bg-red-100 text-red-800 border border-red-300' },
  completed: { label: 'Terminé', color: 'bg-blue-100 text-blue-800 border border-blue-300' },
  COMPLETED: { label: 'Terminé', color: 'bg-blue-100 text-blue-800 border border-blue-300' },
};

const RdvHistoryTable = ({ filters }: RdvHistoryTableProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<'date' | 'patient' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await secretaryService.getAllAppointments(filters);
      if (Array.isArray(data)) {
        setAppointments(data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [JSON.stringify(filters)]);

  const sortedAppointments = Array.isArray(appointments)
    ? [...appointments].sort((a, b) => {
      let compareValue = 0;
      if (sortColumn === 'date') {
        const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
        const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
        compareValue = dateA.getTime() - dateB.getTime();
      } else if (sortColumn === 'patient') {
        const nameA = `${a.user.firstName} ${a.user.lastName}`.toLowerCase();
        const nameB = `${b.user.firstName} ${b.user.lastName}`.toLowerCase();
        compareValue = nameA.localeCompare(nameB);
      } else if (sortColumn === 'status') {
        compareValue = a.status.localeCompare(b.status);
      }
      return sortDirection === 'asc' ? compareValue : -compareValue;
    })
    : [];

  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = sortedAppointments.slice(startIndex, endIndex);

  const handleSort = (column: 'date' | 'patient' | 'status') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-300 rounded-lg h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 bg-gray-50 rounded-lg shadow-md">
        <Search className="mx-auto text-gray-400 mb-4 sm:mb-5" size={48} />
        <p className="text-gray-600 text-lg sm:text-xl font-semibold">Aucun rendez-vous trouvé</p>
        <p className="text-gray-400 text-xs sm:text-sm mt-2">Essayez de modifier vos filtres</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="w-full min-w-[700px] table-auto">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th
                onClick={() => handleSort('patient')}
                className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Patient
                  {sortColumn === 'patient' && <span className="text-xs">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </div>
              </th>
              <th
                onClick={() => handleSort('date')}
                className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Date & Heure
                  {sortColumn === 'date' && <span className="text-xs">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Statut
                  {sortColumn === 'status' && <span className="text-xs">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type de RDV</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Paiement</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Assurance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentAppointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                {/* Patient */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#006D65] text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold text-base tracking-tight select-none flex-shrink-0">
                      {apt.user.firstName[0]}{apt.user.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 select-text truncate">
                        {apt.user.firstName} {apt.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 select-text truncate">{apt.user.phone}</p>
                    </div>
                  </div>
                </td>

                {/* Date & Heure */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                      <Calendar size={16} className="text-[#006D65] flex-shrink-0" />
                      <span>{new Date(apt.appointmentDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} className="text-[#006D65] flex-shrink-0" />
                      <span>{apt.appointmentTime}</span>
                    </div>
                  </div>
                </td>

                {/* Statut - AMÉLIORÉ */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-base font-bold ${STATUS_LABELS[apt.status]?.color || 'bg-gray-100 text-gray-800 border border-gray-300'} select-none shadow-sm`}>
                    {STATUS_LABELS[apt.status]?.label || apt.status}
                  </span>
                </td>

                {/* Type de RDV */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#E6A930]/10 to-[#E6A930]/20 border-l-4 border-[#E6A930] rounded text-sm font-bold text-gray-800">
                    {apt.consultationType?.name || apt.serviceType || 'Non spécifié'}
                  </span>
                </td>

                {/* Paiement */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <CreditCard size={16} className="text-[#006D65] flex-shrink-0" />
                    <span>{apt.paymentMethod === 'SUR_PLACE' ? 'Sur place' : 'En ligne'}</span>
                  </div>
                </td>

                {/* Assurance */}
                <td className="px-6 py-4">
                  {apt.isInsured ? (
                    <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-bold border border-blue-300 select-none shadow-sm">
                      <Shield size={14} />
                      Assuré
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 select-text font-medium">Non assuré</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 sm:space-y-5">
        {currentAppointments.map((apt) => (
          <div key={apt.id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="bg-[#006D65] text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-semibold text-base sm:text-lg tracking-tight select-none flex-shrink-0">
                {apt.user.firstName[0]}{apt.user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                  {apt.user.firstName} {apt.user.lastName}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 select-text truncate">{apt.user.phone}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${STATUS_LABELS[apt.status]?.color || 'bg-gray-100 text-gray-800 border border-gray-300'} select-none flex-shrink-0 shadow-sm`}>
                {STATUS_LABELS[apt.status]?.label || apt.status}
              </span>
            </div>

            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#006D65] flex-shrink-0" />
                <span className="font-medium">{new Date(apt.appointmentDate).toLocaleDateString('fr-FR')} à {apt.appointmentTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-[#006D65] flex-shrink-0" />
                <span className="truncate font-medium px-2 py-1 bg-gradient-to-r from-[#E6A930]/10 to-[#E6A930]/20 border-l-4 border-[#E6A930] rounded">
                  {apt.consultationType?.name || apt.serviceType || 'Non spécifié'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <CreditCard size={16} className="text-[#006D65] flex-shrink-0" />
                <span className="font-medium">{apt.paymentMethod === 'SUR_PLACE' ? 'Sur place' : 'En ligne'}</span>
                {apt.isInsured && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold border border-blue-300 ml-2 select-none shadow-sm">
                    <Shield size={12} />
                    Assuré
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination navigation" className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-4 sm:px-6 py-4 rounded-lg shadow-md">
          <p className="text-xs sm:text-sm text-gray-600 select-none text-center sm:text-left font-medium">
            Affichage {startIndex + 1} - {Math.min(endIndex, appointments.length)} sur {appointments.length} résultats
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              aria-label="Page précédente"
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 select-none">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              aria-label="Page suivante"
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default RdvHistoryTable;