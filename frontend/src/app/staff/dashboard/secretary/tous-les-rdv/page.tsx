'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download } from 'lucide-react';
import RdvHistoryTable from '../components/RdvHistoryTable';
import FilterBar from '../components/FilterBar';
import { secretaryService, type Appointment } from '@/services/secretaryService';

export default function TousLesRdvPage() {
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    patient: '',
  });

  const [stats, setStats] = useState({
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    completed: 0,
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await secretaryService.getAllAppointments(filters);
        if (Array.isArray(data)) {
          setAppointments(data);
          
          if (!filters.status && !filters.date && !filters.patient) {
            setAllAppointments(data);
          }
          
          const normalizedData = data.map(apt => ({
            ...apt,
            normalizedStatus: apt.status.toLowerCase()
          }));
          
          const confirmed = normalizedData.filter(apt => 
            ['confirme', 'confirmed', 'confirmé'].includes(apt.normalizedStatus)
          ).length;
          
          const pending = normalizedData.filter(apt => 
            ['en_attente', 'pending', 'en attente'].includes(apt.normalizedStatus)
          ).length;
          
          const cancelled = normalizedData.filter(apt => 
            ['annule', 'cancelled', 'annulé'].includes(apt.normalizedStatus)
          ).length;
          
          const completed = normalizedData.filter(apt => 
            ['termine', 'completed', 'terminé'].includes(apt.normalizedStatus)
          ).length;
          
          setStats({ confirmed, pending, cancelled, completed });
        }
      } catch (error) {
        // Erreur silencieuse
      }
    };

    fetchData();
  }, [filters]);

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, patient: search }));
  };

  const handleStatusChange = (status: string) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleExportCSV = () => {
    if (appointments.length === 0) {
      return;
    }

    const headers = [
      'Prénom',
      'Nom',
      'Téléphone',
      'Date',
      'Heure',
      'Type de service',
      'Statut',
      'Paiement',
      'Assuré'
    ];

    const rows = appointments.map(apt => [
      apt.user.firstName,
      apt.user.lastName,
      apt.user.phone,
      new Date(apt.appointmentDate).toLocaleDateString('fr-FR'),
      apt.appointmentTime,
      apt.serviceType,
      apt.status === 'EN_ATTENTE' || apt.status === 'pending' ? 'En attente' :
      apt.status === 'CONFIRME' || apt.status === 'confirmed' ? 'Confirmé' :
      apt.status === 'ANNULE' || apt.status === 'cancelled' ? 'Annulé' :
      apt.status === 'TERMINE' || apt.status === 'completed' ? 'Terminé' : apt.status,
      apt.paymentMethod === 'SUR_PLACE' ? 'Sur place' : 'En ligne',
      apt.isInsured ? 'Oui' : 'Non'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `rendez-vous-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const normalizedAllAppointments = allAppointments.map(apt => ({
    ...apt,
    normalizedStatus: apt.status.toLowerCase()
  }));

  const totalStats = {
    confirmed: normalizedAllAppointments.filter(apt => 
      ['confirme', 'confirmed', 'confirmé'].includes(apt.normalizedStatus)
    ).length,
    pending: normalizedAllAppointments.filter(apt => 
      ['en_attente', 'pending', 'en attente'].includes(apt.normalizedStatus)
    ).length,
    cancelled: normalizedAllAppointments.filter(apt => 
      ['annule', 'cancelled', 'annulé'].includes(apt.normalizedStatus)
    ).length,
    completed: normalizedAllAppointments.filter(apt => 
      ['termine', 'completed', 'terminé'].includes(apt.normalizedStatus)
    ).length,
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Contenu principal */}
      <div className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-xl shrink-0">
              <Calendar className="text-blue-600" size={32} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                Tous les rendez-vous
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Historique complet des rendez-vous avec filtres avancés
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="w-full lg:w-auto bg-[#006D65] hover:bg-[#005550] text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium shadow-lg hover:shadow-xl shrink-0"
          >
            <Download size={20} />
            Exporter CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200 shadow-sm">
            <p className="text-green-700 text-sm font-medium mb-2">Confirmés</p>
            <p className="text-4xl font-bold text-green-700">{totalStats.confirmed}</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200 shadow-sm">
            <p className="text-yellow-700 text-sm font-medium mb-2">En attente</p>
            <p className="text-4xl font-bold text-yellow-700">{totalStats.pending}</p>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-red-200 shadow-sm">
            <p className="text-red-700 text-sm font-medium mb-2">Annulés</p>
            <p className="text-4xl font-bold text-red-700">{totalStats.cancelled}</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-sm">
            <p className="text-blue-700 text-sm font-medium mb-2">Terminés</p>
            <p className="text-4xl font-bold text-blue-700">{totalStats.completed}</p>
          </div>
        </div>

        {/* Filtres */}
        <FilterBar
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          showStatusFilter={true}
          placeholder="Rechercher par nom de patient..."
        />

        {/* Tableau */}
        <RdvHistoryTable filters={filters} />
      </div>

      {/* Footer OSIRIX - Simple comme la page RDV en attente */}
      <div className="text-center space-y-2 mt-8 py-4 sm:py-6 border-t border-gray-200 bg-white">
        <p className="text-xs sm:text-sm text-gray-600 px-4">
          © 2025 <span className="font-semibold text-[#006D65]">OSIRIX</span> - Tous droits réservés
        </p>
      </div>
    </div>
  );
}