'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, Clock, User, CreditCard, Shield, CheckCircle, XCircle, RefreshCw, AlertCircle, List, Grid } from 'lucide-react';
import { secretaryService, type Appointment } from '@/services/secretaryService';

interface RdvEnAttenteListProps {
  limit?: number;
  onRefresh?: () => void;
  searchFilter?: string;
  onCountChange?: (count: number) => void;
  refreshTrigger?: number;
}

const RdvEnAttenteList = ({ 
  limit, 
  onRefresh, 
  searchFilter = '', 
  onCountChange,
  refreshTrigger
}: RdvEnAttenteListProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // États pour le popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'success' | 'error'>('success');

  // État pour l'auto-refresh
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  // ✅ NOUVEAU : État pour la vue Grille/Liste
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const displayPopup = (message: string, type: 'success' | 'error' = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  const fetchAppointments = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await secretaryService.getPendingAppointments();  
      setAppointments(data);
      onCountChange?.(data.length);
    } catch (error) {
      console.error('Erreur chargement RDV:', error);
      if (!silent) {
        displayPopup('Erreur lors du chargement des rendez-vous', 'error');
      }
    } finally {
      if (!silent) setLoading(false);
      setIsAutoRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchAppointments();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!showConfirmModal && !showCancelModal) {
        setIsAutoRefreshing(true);
        fetchAppointments(true);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [showConfirmModal, showCancelModal]);

  const filteredAppointments = useMemo(() => {
    if (!searchFilter.trim()) return appointments;
    
    const search = searchFilter.toLowerCase();
    return appointments.filter(apt => 
      apt.user.firstName.toLowerCase().includes(search) ||
      apt.user.lastName.toLowerCase().includes(search) ||
      apt.user.email.toLowerCase().includes(search) ||
      apt.user.phone.includes(search)
    );
  }, [appointments, searchFilter]);

  const limitedAppointments = useMemo(() => {
    return limit ? filteredAppointments.slice(0, limit) : filteredAppointments;
  }, [filteredAppointments, limit]);

  const handleRefresh = () => {
    fetchAppointments();
    onRefresh?.();
  };

  const handleConfirm = async () => {
    if (!selectedId || !selectedAppointment) return;
    
    try {
      setActionLoading(true);
      await secretaryService.confirmAppointment(selectedId, notes);
      await fetchAppointments(true);
      
      setShowConfirmModal(false);
      setNotes('');
      setSelectedId(null);
      setSelectedAppointment(null);
      
      displayPopup('Rendez-vous confirmé avec succès !', 'success');
      onRefresh?.();
    } catch (error) {
      console.error('Erreur confirmation:', error);
      displayPopup('Erreur lors de la confirmation. Veuillez réessayer.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedId || !selectedAppointment || !cancelReason.trim()) return;
    
    try {
      setActionLoading(true);
      await secretaryService.cancelAppointment(selectedId, cancelReason);
      await fetchAppointments(true);
      
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedId(null);
      setSelectedAppointment(null);
      
      displayPopup('Rendez-vous annulé avec succès !', 'success');
      onRefresh?.();
    } catch (error) {
      console.error('Erreur annulation:', error);
      displayPopup('Erreur lors de l\'annulation. Veuillez réessayer.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirmModal = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setSelectedId(apt.id);
    setNotes('');
    setShowConfirmModal(true);
    setTimeout(() => modalRef.current?.focus(), 0);
  };

  const openCancelModal = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setSelectedId(apt.id);
    setCancelReason('');
    setShowCancelModal(true);
    setTimeout(() => modalRef.current?.focus(), 0);
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowConfirmModal(false);
      setShowCancelModal(false);
      setSelectedId(null);
      setSelectedAppointment(null);
      setNotes('');
      setCancelReason('');
    }
  };

  if (loading) {
    return (
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gray-300 rounded-full w-10 h-10 sm:w-12 sm:h-12" />
              <div className="flex-1 space-y-2">
                <div className="h-4 sm:h-5 bg-gray-300 rounded w-32 sm:w-48" />
                <div className="h-3 sm:h-4 bg-gray-300 rounded w-24 sm:w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredAppointments.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl border border-gray-200">
        <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
        <p className="text-gray-700 text-base sm:text-lg font-medium px-4">
          {searchFilter.trim() ? 'Aucun rendez-vous trouvé pour cette recherche' : 'Aucun rendez-vous en attente'}
        </p>
        <p className="text-gray-500 text-xs sm:text-sm mt-2 px-4">
          {searchFilter.trim() ? 'Essayez avec un autre terme de recherche' : 'Tous les RDV ont été traités. Bravo !'}
        </p>
        <button
          onClick={handleRefresh}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#006D65] text-white rounded-lg hover:bg-[#005a5a] transition-colors text-sm sm:text-base"
        >
          <RefreshCw size={16} />
          Actualiser
        </button>
      </div>
    );
  }

  return (
    <>
      {/* POPUP DE NOTIFICATION */}
      {showPopup && (
        <div className="fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-slideDown px-4 w-full max-w-md">
          <div className={`${
            popupType === 'success' 
              ? 'bg-gradient-to-r from-green-500 to-green-600' 
              : 'bg-gradient-to-r from-red-500 to-red-600'
          } text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl flex items-center gap-3 border-2 border-white/20`}>
            {popupType === 'success' ? (
              <CheckCircle size={24} className="flex-shrink-0" />
            ) : (
              <AlertCircle size={24} className="flex-shrink-0" />
            )}
            <span className="font-medium text-sm sm:text-base flex-1">{popupMessage}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Header avec toggle Vue */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
            Rendez-vous en attente ({limitedAppointments.length})
            {isAutoRefreshing && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <RefreshCw size={12} className="animate-spin" />
                <span className="hidden sm:inline">Actualisation...</span>
              </span>
            )}
          </h2>
          
          {/* ✅ NOUVEAU : Boutons toggle + Actualiser */}
          <div className="flex items-center gap-2">
            {/* Toggle Grille/Liste */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-white text-[#006D65] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Vue liste"
              >
                <List size={16} />
                <span className="hidden sm:inline">Liste</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all text-sm font-medium ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#006D65] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Vue grille"
              >
                <Grid size={16} />
                <span className="hidden sm:inline">Grille</span>
              </button>
            </div>

            {/* Bouton Actualiser */}
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-[#006D65] text-white rounded-lg hover:bg-[#005a5a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#006D65]/50 text-sm"
              aria-label="Actualiser la liste"
            >
              <RefreshCw size={16} />
              <span className="hidden md:inline">Actualiser</span>
            </button>
          </div>
        </div>
        
        {/* ✅ Affichage conditionnel selon viewMode */}
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'grid grid-cols-1 gap-4'
        }>
          {limitedAppointments.map((apt, index) => (
            <div
              key={apt.id}
              className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 opacity-0 animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={viewMode === 'list' 
                ? 'flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4' 
                : 'flex flex-col gap-4'
              }>
                {/* Infos patient */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#006D65] text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold flex-shrink-0 shadow-md text-sm sm:text-base">
                      {apt.user.firstName[0]}{apt.user.lastName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                        {apt.user.firstName} {apt.user.lastName}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{apt.user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} className="text-[#006D65] flex-shrink-0" />
                      <span className="font-medium">{new Date(apt.appointmentDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} className="text-[#006D65] flex-shrink-0" />
                      <span className="font-medium">{apt.appointmentTime}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-900 col-span-1 sm:col-span-2 bg-gradient-to-r from-[#E6A930]/10 to-transparent p-2 sm:p-3 rounded-lg border-l-4 border-[#E6A930]">
                      <User size={18} className="text-[#E6A930] flex-shrink-0" />
                      <span className="font-bold text-sm sm:text-base">
                        {apt.consultationType?.name || apt.serviceType}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <CreditCard size={16} className="text-[#006D65] flex-shrink-0" />
                      <span className="font-medium">
                        {apt.paymentMethod === 'SUR_PLACE' ? 'Sur place' : 'En ligne'}
                      </span>
                    </div>
                  </div>

                  {apt.isInsured && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium border border-blue-200">
                        <Shield size={14} />
                        Assuré
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className={viewMode === 'list' 
                  ? 'flex flex-col gap-2 lg:w-40 xl:w-48 self-stretch lg:self-start' 
                  : 'flex flex-col gap-2'
                }>
                  <button
                    onClick={() => openConfirmModal(apt)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm sm:text-base"
                    aria-label={`Confirmer le rendez-vous de ${apt.user.firstName} ${apt.user.lastName}`}
                  >
                    <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Confirmer
                  </button>
                  <button
                    onClick={() => openCancelModal(apt)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm sm:text-base"
                    aria-label={`Annuler le rendez-vous de ${apt.user.firstName} ${apt.user.lastName}`}
                  >
                    <XCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Confirmation */}
      {showConfirmModal && selectedAppointment && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn" 
          onKeyDown={handleModalKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          ref={modalRef}
          tabIndex={-1}
        >
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
            <h3 id="confirm-title" className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">
              Confirmer le rendez-vous
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              {selectedAppointment.user.firstName} {selectedAppointment.user.lastName} - {new Date(selectedAppointment.appointmentDate).toLocaleDateString('fr-FR')} à {selectedAppointment.appointmentTime}
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes supplémentaires (optionnel)"
              className="w-full border border-gray-300 rounded-xl p-3 mb-3 sm:mb-4 focus:ring-2 focus:ring-[#006D65]/50 focus:border-transparent resize-none text-sm sm:text-base"
              rows={3}
              aria-label="Notes pour la confirmation"
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleConfirm}
                disabled={actionLoading}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 sm:py-2.5 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm sm:text-base flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Confirmation...
                  </>
                ) : (
                  'Confirmer'
                )}
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setNotes('');
                  setSelectedId(null);
                  setSelectedAppointment(null);
                }}
                disabled={actionLoading}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 sm:py-2.5 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/50 text-sm sm:text-base"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Annulation */}
      {showCancelModal && selectedAppointment && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn" 
          onKeyDown={handleModalKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-title"
          ref={modalRef}
          tabIndex={-1}
        >
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
            <h3 id="cancel-title" className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">
              Annuler le rendez-vous
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              {selectedAppointment.user.firstName} {selectedAppointment.user.lastName} - {new Date(selectedAppointment.appointmentDate).toLocaleDateString('fr-FR')} à {selectedAppointment.appointmentTime}
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Raison de l'annulation (obligatoire)"
              className="w-full border border-gray-300 rounded-xl p-3 mb-2 sm:mb-3 focus:ring-2 focus:ring-red-500/50 focus:border-transparent resize-none text-sm sm:text-base"
              rows={3}
              required
              aria-label="Raison de l'annulation"
              aria-invalid={!cancelReason.trim()}
            />
            {!cancelReason.trim() && (
              <p className="text-xs sm:text-sm text-red-600 mb-3 sm:mb-4">La raison est obligatoire.</p>
            )}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleCancel}
                disabled={actionLoading || !cancelReason.trim()}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 sm:py-2.5 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm sm:text-base flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Annulation...
                  </>
                ) : (
                  'Annuler le RDV'
                )}
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedId(null);
                  setSelectedAppointment(null);
                }}
                disabled={actionLoading}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 sm:py-2.5 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/50 text-sm sm:text-base"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translate(-50%, -20px);
          }
          to { 
            opacity: 1; 
            transform: translate(-50%, 0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default RdvEnAttenteList;