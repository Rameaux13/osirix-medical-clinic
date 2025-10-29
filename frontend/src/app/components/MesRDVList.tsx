import React, { useState, useEffect } from 'react';
import useMyAppointments from '@/hooks/useMyAppointments';
import { useAuthStore } from '@/store/auth';

// Icônes SVG
const Calendar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const Clock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const User = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MapPin = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const Edit = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.732-.833-2.5 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const Stethoscope = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const Trash = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

interface MesRendezVousProps {
  onNavigateToNewAppointment: () => void;
  onNavigateToDashboard?: () => void;
}

export default function MesRendezVous({ onNavigateToNewAppointment, onNavigateToDashboard }: MesRendezVousProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  // NOUVEAUX ÉTATS pour la pagination avec bouton "Voir plus"
  const [displayLimits, setDisplayLimits] = useState({
    upcoming: 10,
    past: 10,
    cancelled: 10
  });

  // États pour les modals d'annulation
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentForCancel, setSelectedAppointmentForCancel] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // États pour les modals de modification
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointmentForEdit, setSelectedAppointmentForEdit] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  
  // NOUVEAUX ÉTATS pour la grille de créneaux
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // NOUVEAUX ÉTATS pour suppression définitive
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointmentForDelete, setSelectedAppointmentForDelete] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Hook personnalisé AVEC la nouvelle fonction de suppression
  const {
    filteredAppointments,
    loading,
    error,
    refetch,
    cancelAppointment,
    updateAppointment,
    deleteAppointmentPermanent  // NOUVEAU
  } = useMyAppointments({ autoFetch: true });

  // NOUVELLE FONCTION - Augmenter la limite d'affichage pour un onglet
  const loadMoreAppointments = (tabName: 'upcoming' | 'past' | 'cancelled') => {
    setDisplayLimits(prev => ({
      ...prev,
      [tabName]: prev[tabName] + 10
    }));
  };

  // Surveillance des changements de rendez-vous
  useEffect(() => {
  }, [filteredAppointments]);

  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetch();
      }
    };

    // Rafraîchir au focus de la fenêtre
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Rafraîchir au montage du composant
    refetch();

    // Rafraîchissement périodique toutes les 30 secondes quand l'onglet est actif
    const interval = setInterval(() => {
      if (!document.hidden) {
        refetch();
      }
    }, 30000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [refetch]);

  // Fonctions d'annulation
  const openCancelModal = (appointment: any) => {
    setSelectedAppointmentForCancel(appointment);
    setShowCancelModal(true);
    setCancelReason('');
  };

  const confirmCancelAppointment = async () => {
    if (!selectedAppointmentForCancel || !cancelReason.trim()) {
      alert('Veuillez indiquer le motif d\'annulation');
      return;
    }

    try {
      setCancellingId(selectedAppointmentForCancel.id);
      await cancelAppointment(selectedAppointmentForCancel.id, cancelReason);
      setShowCancelModal(false);
      setSelectedAppointmentForCancel(null);
      setCancelReason('');
    } catch (err) {
    } finally {
      setCancellingId(null);
    }
  };

  // Fonctions de modification
  const openEditModal = async (appointment: any) => {
    setSelectedAppointmentForEdit(appointment);
    setEditFormData({
      appointmentDate: appointment.appointmentDate.toISOString().split('T')[0],
      appointmentTime: appointment.appointmentTime,
      notes: appointment.notes || ''
    });
    setShowEditModal(true);
    
    // Charger les créneaux occupés pour cette date et ce service
    await loadUnavailableSlots(
      appointment.appointmentDate.toISOString().split('T')[0],
      appointment.consultationType?.name
    );
  };

  // NOUVELLE FONCTION - Charger les créneaux occupés
  const loadUnavailableSlots = async (date: string, serviceName?: string) => {
    setLoadingSlots(true);
    try {
      const url = serviceName
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/appointments/availability/${date}?service=${encodeURIComponent(serviceName)}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/appointments/availability/${date}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des créneaux');
      }

      const data = await response.json();
      setUnavailableSlots(data.unavailableSlots || []);
    } catch (error) {
      setUnavailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // NOUVELLE FONCTION - Générer tous les créneaux de la journée (8h00 → 18h30)
  const generateAllTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Arrêter après 18h30
        if (hour === 18 && minute > 30) break;
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  // NOUVELLE FONCTION - Vérifier si un créneau est disponible
  const isSlotAvailable = (time: string) => {
    // Le créneau actuel du patient est toujours disponible
    if (selectedAppointmentForEdit && time === selectedAppointmentForEdit.appointmentTime) {
      return true;
    }
    // Sinon, vérifier s'il n'est pas dans la liste des indisponibles
    return !unavailableSlots.includes(time);
  };

  const checkAvailability = async (date: string, time: string, excludeAppointmentId?: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/appointments/availability/${date}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${useAuthStore.getState().token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la vérification de disponibilité');
      }

      const data = await response.json();
      const unavailableSlots = data.unavailableSlots || [];

      return !unavailableSlots.includes(time);
    } catch (error) {
      return false;
    }
  };

  const confirmEditAppointment = async () => {
    if (!selectedAppointmentForEdit) return;

    setEditLoading(true);
    setEditError('');

    try {
      const isNewSlot = editFormData.appointmentDate !== selectedAppointmentForEdit.appointmentDate.toISOString().split('T')[0] ||
        editFormData.appointmentTime !== selectedAppointmentForEdit.appointmentTime;

      if (isNewSlot) {
        const isAvailable = await checkAvailability(
          editFormData.appointmentDate,
          editFormData.appointmentTime,
          selectedAppointmentForEdit.id
        );

        if (!isAvailable) {
          setEditError('Ce créneau horaire est déjà occupé. Veuillez choisir une autre heure.');
          return;
        }
      }

      await updateAppointment(selectedAppointmentForEdit.id, {
        appointmentDate: editFormData.appointmentDate,
        appointmentTime: editFormData.appointmentTime,
        notes: editFormData.notes
      });

      setShowEditModal(false);
      setSelectedAppointmentForEdit(null);
      setEditError('');
      setUnavailableSlots([]); // Réinitialiser les créneaux
    } catch (err) {
      setEditError('Impossible de modifier le rendez-vous. Veuillez réessayer.');
    } finally {
      setEditLoading(false);
    }
  };

  // NOUVELLE FONCTION - Gérer le changement de date dans le modal
  const handleDateChange = async (newDate: string) => {
    setEditFormData({ ...editFormData, appointmentDate: newDate });
    // Recharger les créneaux pour la nouvelle date
    if (selectedAppointmentForEdit?.consultationType?.name) {
      await loadUnavailableSlots(newDate, selectedAppointmentForEdit.consultationType.name);
    }
  };

  // NOUVELLES FONCTIONS pour suppression définitive
  const openDeleteModal = (appointment: any) => {
    setSelectedAppointmentForDelete(appointment);
    setShowDeleteModal(true);
  };

  const confirmDeleteAppointment = async () => {
    if (!selectedAppointmentForDelete) return;

    try {
      setDeletingId(selectedAppointmentForDelete.id);
      await deleteAppointmentPermanent(selectedAppointmentForDelete.id);
      setShowDeleteModal(false);
      setSelectedAppointmentForDelete(null);
    } catch (err) {
    } finally {
      setDeletingId(null);
    }
  };

  // Configuration des onglets
  const tabs = [
    {
      id: 'upcoming' as const,
      label: 'À venir',
      count: filteredAppointments.upcoming.length,
      icon: Clock
    },
    {
      id: 'past' as const,
      label: 'Passés',
      count: filteredAppointments.past.length,
      icon: Calendar
    },
    {
      id: 'cancelled' as const,
      label: 'Annulés',
      count: filteredAppointments.cancelled.length,
      icon: X
    }
  ];

  // Fonctions utilitaires
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'scheduled':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'Confirmé';
      case 'scheduled':
        return 'Programmé';
      case 'pending':
        return 'En attente';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus.toLowerCase()) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'refunded':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getPaymentStatusLabel = (paymentStatus: string) => {
    switch (paymentStatus.toLowerCase()) {
      case 'paid':
        return 'Payé';
      case 'failed':
        return 'Paiement échoué';
      case 'refunded':
        return 'Remboursé';
      default:
        return 'Statut inconnu';
    }
  };

  // Loading state
  if (loading && filteredAppointments.upcoming.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#006D65] rounded-full mb-6">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chargement de vos rendez-vous...</h3>
            <p className="text-gray-600">Veuillez patienter quelques instants</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={refetch}
              className="inline-flex items-center px-6 py-3 bg-[#006D65] text-white rounded-lg hover:bg-[#005a54] transition-colors font-medium shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const AppointmentCard = ({ appointment }: { appointment: any }) => (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
      <div className="p-4 sm:p-6">
        {/* En-tête avec informations médecin - TEXTE RÉDUIT MOBILE */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1">
              {appointment.doctor
                ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                : ''
              }
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-[#006D65] font-medium">
              {appointment.consultationType?.name || 'Consultation générale'}
            </p>
          </div>

          {/* Badges de statut - TAILLE RÉDUITE MOBILE */}
          <div className="flex flex-col space-y-2">
            <span className={`inline-flex px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md ${getStatusColor(appointment.status)}`}>
              {getStatusLabel(appointment.status)}
            </span>
            {appointment.paymentStatus !== 'pending' && (
              <span className={`inline-flex px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md ${getPaymentStatusColor(appointment.paymentStatus)}`}>
                {getPaymentStatusLabel(appointment.paymentStatus)}
              </span>
            )}
          </div>
        </div>

        {/* Message de remerciement pour RDV terminés */}
        {appointment.status === 'TERMINE' && (
          <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-[#006D65]/5 border-2 border-green-200 rounded-xl shadow-sm">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-green-800 font-bold text-sm sm:text-base lg:text-lg mb-1">
                  Merci d'être venu à la clinique OSIRIX
                </p>
                <p className="text-green-700 text-xs sm:text-sm lg:text-base">
                  Votre consultation est terminée. Nous espérons vous avoir apporté les meilleurs soins.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informations de rendez-vous - TAILLE RÉDUITE MOBILE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <div>
              <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide font-medium">Date</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900">{formatDate(appointment.appointmentDate)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <div>
              <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide font-medium">Heure</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900">{formatTime(appointment.appointmentTime)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <div>
              <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide font-medium">Lieu</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900">OSIRIX Clinique</p>
            </div>
          </div>
        </div>

        {/* Informations supplémentaires si disponibles - TAILLE RÉDUITE MOBILE */}
        {(appointment.chiefComplaint || (appointment.notes && !appointment.notes.includes('Non assuré') && !appointment.notes.includes('NON_RENSEIGNE'))) && (
          <div className="space-y-3 mb-4">
            {appointment.chiefComplaint && (
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border-l-4 border-[#006D65]">
                <p className="text-sm sm:text-base text-gray-700">
                  <span className="font-semibold text-gray-900">Motif :</span> {appointment.chiefComplaint}
                </p>
                {appointment.urgencyLevel !== 'normal' && (
                  <p className="text-sm sm:text-base text-gray-600 mt-2">
                    <span className="font-semibold">Urgence :</span>
                    <span className="ml-2 px-2 sm:px-3 py-1 bg-red-100 text-red-800 rounded text-xs sm:text-sm font-semibold">
                      {appointment.urgencyLevel}
                    </span>
                  </p>
                )}
              </div>
            )}

            {appointment.notes && !appointment.notes.includes('Non assuré') && !appointment.notes.includes('NON_RENSEIGNE') && (
              <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg border-l-4 border-[#E6A930]">
                <p className="text-sm sm:text-base text-gray-700">
                  <span className="font-semibold text-gray-900">Notes :</span> {appointment.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions avec boutons stylisés - TAILLE RÉDUITE MOBILE */}
        {activeTab === 'upcoming' && (
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => openEditModal(appointment)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-[#006D65] bg-[#006D65]/5 hover:bg-[#006D65]/10 rounded-lg border border-[#006D65]/20 hover:border-[#006D65]/30 transition-all duration-200"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Modifier
            </button>

            <button
              onClick={() => openCancelModal(appointment)}
              disabled={cancellingId === appointment.id}
              className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 hover:border-amber-300 transition-all duration-200 disabled:opacity-50"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              {cancellingId === appointment.id ? 'Annulation...' : 'Annuler'}
            </button>
          </div>
        )}

        {/* BOUTON - Supprimer définitivement pour les RDV annulés - TAILLE RÉDUITE MOBILE */}
        {activeTab === 'cancelled' && (
          <div className="flex items-center justify-end pt-4 border-t border-gray-100">
            <button
              onClick={() => openDeleteModal(appointment)}
              disabled={deletingId === appointment.id}
              className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
            >
              <Trash className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              {deletingId === appointment.id ? 'Suppression...' : 'Supprimer définitivement'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const currentAppointments = filteredAppointments[activeTab];
  const currentDisplayLimit = displayLimits[activeTab];
  const displayedAppointments = currentAppointments.slice(0, currentDisplayLimit);
  const hasMoreAppointments = currentAppointments.length > currentDisplayLimit;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* En-tête simple et élégant - RESPONSIVE */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#006D65] rounded-full mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Mes Rendez-vous</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            Gérez facilement tous vos rendez-vous médicaux en un seul endroit
          </p>
        </div>

        {/* Barre d'actions avec onglets et bouton nouveau RDV - RESPONSIVE */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          {/* Onglets - RESPONSIVE */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 rounded-md font-semibold text-sm sm:text-base transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#006D65] text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>{tab.label}</span>
                  <span className={`ml-2 px-2 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold rounded-full ${
                    activeTab === tab.id
                      ? 'bg-white text-[#006D65]'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bouton Nouveau RDV - RESPONSIVE */}
          <button
            onClick={onNavigateToNewAppointment}
            className="w-full lg:w-auto flex items-center justify-center px-4 sm:px-5 py-2 sm:py-3 bg-[#E6A930] text-white rounded-lg hover:bg-[#d49821] transition-colors font-semibold text-sm sm:text-base shadow-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Nouveau RDV
          </button>
        </div>

        {/* Liste des rendez-vous */}
        <div className="space-y-4">
          {displayedAppointments.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4">
                {displayedAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>

              {/* SYSTÈME DE PAGINATION INTELLIGENT - RESPONSIVE */}
              {currentAppointments.length > 10 && (
                <div className="text-center pt-6">
                  {!hasMoreAppointments ? (
                    // Bouton "Afficher moins"
                    <button
                      onClick={() => setDisplayLimits(prev => ({ ...prev, [activeTab]: 10 }))}
                      className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm sm:text-base shadow-sm"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Afficher moins
                    </button>
                  ) : (
                    // Boutons "Voir plus" et "Voir tout"
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3">
                      <button
                        onClick={() => loadMoreAppointments(activeTab)}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-3 bg-white text-[#006D65] border border-[#006D65] rounded-lg hover:bg-[#006D65] hover:text-white transition-colors font-semibold text-sm sm:text-base shadow-sm"
                      >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Voir plus (+10)
                      </button>

                      <button
                        onClick={() => setDisplayLimits(prev => ({ ...prev, [activeTab]: currentAppointments.length }))}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-3 bg-[#E6A930] text-white rounded-lg hover:bg-[#d49821] transition-colors font-semibold text-sm sm:text-base shadow-sm"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        Voir tout ({currentAppointments.length})
                      </button>
                    </div>
                  )}

                  <p className="text-sm sm:text-base text-gray-500 mt-3">
                    {hasMoreAppointments
                      ? `Affichage de ${displayedAppointments.length} sur ${currentAppointments.length} rendez-vous`
                      : `Tous vos ${currentAppointments.length} rendez-vous sont affichés`
                    }
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {activeTab === 'upcoming' && 'Aucun rendez-vous à venir'}
                {activeTab === 'past' && 'Aucun rendez-vous passé'}
                {activeTab === 'cancelled' && 'Aucun rendez-vous annulé'}
              </h3>
              <p className="text-base text-gray-600 mb-6 max-w-sm mx-auto">
                {activeTab === 'upcoming' && 'Prenez votre premier rendez-vous pour commencer votre suivi médical'}
                {activeTab === 'past' && 'Votre historique de consultations apparaîtra ici'}
                {activeTab === 'cancelled' && 'Les rendez-vous annulés s\'afficheront dans cette section'}
              </p>
              {activeTab === 'upcoming' && (
                <button
                  onClick={onNavigateToNewAppointment}
                  className="inline-flex items-center px-6 py-3 bg-[#E6A930] text-white rounded-lg hover:bg-[#d49821] transition-colors font-semibold text-base"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Prendre mon premier rendez-vous
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal d'annulation épuré */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Annuler le rendez-vous</h3>
                    <p className="text-sm text-gray-600">Cette action est définitive</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setSelectedAppointmentForCancel(null);
                      setCancelReason('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {selectedAppointmentForCancel && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-900 font-medium">
                      RDV du {formatDate(selectedAppointmentForCancel.appointmentDate)}
                    </p>
                    <p className="text-sm text-gray-600">
                      à {formatTime(selectedAppointmentForCancel.appointmentTime)} - {selectedAppointmentForCancel.consultationType?.name}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif d'annulation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Veuillez indiquer le motif d'annulation..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent resize-none"
                    rows={4}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cette information nous aide à améliorer nos services
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setSelectedAppointmentForCancel(null);
                      setCancelReason('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Conserver
                  </button>
                  <button
                    onClick={confirmCancelAppointment}
                    disabled={!cancelReason.trim() || cancellingId === selectedAppointmentForCancel?.id}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancellingId === selectedAppointmentForCancel?.id ? 'Annulation...' : 'Confirmer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de modification avec GRILLE DE CRÉNEAUX */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="w-10 h-10 bg-[#006D65]/10 rounded-full flex items-center justify-center mr-3">
                    <Edit className="w-5 h-5 text-[#006D65]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Modifier le rendez-vous</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Choisissez un nouveau créneau disponible</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedAppointmentForEdit(null);
                      setEditError('');
                      setUnavailableSlots([]);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Info RDV actuel */}
                {selectedAppointmentForEdit && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-[#006D65]/5 to-gray-50 rounded-lg border border-[#006D65]/20">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Rendez-vous actuel</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900">
                      {selectedAppointmentForEdit.consultationType?.name}
                    </p>
                    {selectedAppointmentForEdit.doctor && (
                      <p className="text-xs sm:text-sm text-gray-600">
                        Dr. {selectedAppointmentForEdit.doctor.firstName} {selectedAppointmentForEdit.doctor.lastName}
                      </p>
                    )}
                  </div>
                )}

                {/* Message d'erreur */}
                {editError && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                      <p className="text-xs sm:text-sm text-red-800">{editError}</p>
                    </div>
                  </div>
                )}

                {/* Sélection de la date */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouvelle date
                  </label>
                  <input
                    type="date"
                    value={editFormData.appointmentDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                {/* GRILLE DE CRÉNEAUX */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Choisissez un créneau horaire
                    </label>
                    {loadingSlots && (
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <div className="animate-spin w-4 h-4 border-2 border-[#006D65] border-t-transparent rounded-full mr-2"></div>
                        Chargement...
                      </div>
                    )}
                  </div>

                  {/* Légende */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 p-3 bg-gray-50 rounded-lg text-xs sm:text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded mr-2 shadow-sm"></div>
                      <span className="text-gray-700">Disponible</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gradient-to-br from-[#006D65] to-[#005a54] rounded mr-2 shadow-sm"></div>
                      <span className="text-gray-700">Sélectionné</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded mr-2"></div>
                      <span className="text-gray-700">Occupé</span>
                    </div>
                  </div>

                  {/* Grille responsive */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 max-h-96 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
                    {generateAllTimeSlots().map((timeSlot) => {
                      const isAvailable = isSlotAvailable(timeSlot);
                      const isSelected = editFormData.appointmentTime === timeSlot;
                      const isCurrentSlot = selectedAppointmentForEdit?.appointmentTime === timeSlot;

                      return (
                        <button
                          key={timeSlot}
                          onClick={() => {
                            if (isAvailable) {
                              setEditFormData({ ...editFormData, appointmentTime: timeSlot });
                              setEditError('');
                            }
                          }}
                          disabled={!isAvailable || loadingSlots}
                          className={`
                            relative p-3 sm:p-4 rounded-xl text-center font-medium transition-all duration-200
                            ${isSelected 
                              ? 'bg-gradient-to-br from-[#006D65] to-[#005a54] text-white shadow-lg transform scale-105 ring-2 ring-[#006D65] ring-offset-2' 
                              : isAvailable
                                ? 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#006D65] hover:shadow-md hover:scale-105'
                                : 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed opacity-50'
                            }
                          `}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-base sm:text-lg font-bold">{timeSlot}</span>
                            {isSelected && (
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            {!isAvailable && !isCurrentSlot && (
                              <span className="text-xs mt-1">Occupé</span>
                            )}
                            {isCurrentSlot && !isSelected && (
                              <span className="text-xs mt-1 text-[#006D65] font-semibold">Actuel</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Info créneaux */}
                  <div className="mt-3 text-xs sm:text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold text-blue-800 mb-1">Horaires de la clinique</p>
                        <p className="text-blue-700">
                          Lundi - Dimanche : 8h00 - 18h30 • Créneaux de 30 minutes
                        </p>
                        <p className="text-blue-700 mt-1">
                          {unavailableSlots.length} créneau{unavailableSlots.length > 1 ? 'x' : ''} occupé{unavailableSlots.length > 1 ? 's' : ''} pour ce service
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes (optionnel) */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    placeholder="Informations supplémentaires..."
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent resize-none text-sm sm:text-base"
                    rows={3}
                  />
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedAppointmentForEdit(null);
                      setEditError('');
                      setUnavailableSlots([]);
                    }}
                    className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmEditAppointment}
                    disabled={editLoading || !editFormData.appointmentTime}
                    className="flex-1 px-4 py-2 sm:py-3 bg-[#006D65] text-white rounded-lg hover:bg-[#005a54] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {editLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Sauvegarde...
                      </span>
                    ) : (
                      'Confirmer la modification'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOUVEAU MODAL - Suppression définitive */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <Trash className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Suppression définitive</h3>
                    <p className="text-sm text-red-600">⚠️ Cette action est irréversible</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedAppointmentForDelete(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {selectedAppointmentForDelete && (
                  <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-gray-900 font-medium mb-2">
                      RDV du {formatDate(selectedAppointmentForDelete.appointmentDate)}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      à {formatTime(selectedAppointmentForDelete.appointmentTime)} - {selectedAppointmentForDelete.consultationType?.name}
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                      <p className="text-xs text-yellow-800">
                        ⚠️ <strong>Attention :</strong> Une fois supprimé définitivement, ce rendez-vous ne pourra plus être récupéré.
                        Toutes les informations associées seront perdues.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedAppointmentForDelete(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Conserver
                  </button>
                  <button
                    onClick={confirmDeleteAppointment}
                    disabled={deletingId === selectedAppointmentForDelete?.id}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {deletingId === selectedAppointmentForDelete?.id ? 'Suppression...' : 'Supprimer définitivement'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}