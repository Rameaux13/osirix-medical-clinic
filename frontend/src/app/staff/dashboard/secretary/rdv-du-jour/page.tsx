'use client';

import { useState, useEffect } from 'react';
import { secretaryService, Appointment } from '@/services/secretaryService';
import { Calendar, Clock, User, CheckCircle, X, RefreshCw } from 'lucide-react';

export default function RdvDuJourPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    loadTodayAppointments();
  }, []);

  const loadTodayAppointments = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const allAppointments = await secretaryService.getAllAppointments({
        date: today,
      });

      const confirmedToday = allAppointments.filter(
        (apt) => apt.status === 'CONFIRMED'
      );

      setAppointments(confirmedToday);
      setTodayCount(confirmedToday.length);
    } catch (error: any) {
      alert(error.message || 'Erreur lors du chargement des RDV');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTodayAppointments();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCompleteClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNotes('');
    setShowModal(true);
  };

  const handleComplete = async () => {
    if (!selectedAppointment) return;

    try {
      setSubmitting(true);
      await secretaryService.completeAppointment(selectedAppointment.id, notes);
      
      alert('Rendez-vous marqué comme terminé avec succès');
      setShowModal(false);
      setSelectedAppointment(null);
      setNotes('');
      
      await loadTodayAppointments();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la finalisation du RDV');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Contenu principal */}
      <div className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <div className="bg-green-50 p-2 sm:p-3 rounded-xl border border-green-200 flex-shrink-0">
              <Calendar className="text-green-600" size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 truncate">
                Rendez-vous du jour
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-1">
                {todayCount > 0
                  ? `${todayCount} consultation${todayCount > 1 ? 's' : ''} confirmée${todayCount > 1 ? 's' : ''} à finaliser`
                  : 'Aucune consultation prévue aujourd\'hui'
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

        {/* Liste des RDV */}
        <div className={`max-w-7xl mx-auto w-full ${isRefreshing ? 'opacity-75 transition-opacity duration-300' : 'transition-opacity duration-300'}`}>
          {appointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
              <Calendar className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-lg sm:text-xl text-gray-600 font-medium">
                Aucun rendez-vous confirmé pour aujourd'hui
              </p>
              <p className="text-sm sm:text-base text-gray-500 mt-2">
                Les consultations confirmées apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                    {/* Infos patient */}
                    <div className="flex-1 space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#006D65] p-2 rounded-lg flex-shrink-0">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                          {appointment.user.firstName} {appointment.user.lastName}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base lg:text-lg text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#006D65]" />
                          <span className="font-semibold">{appointment.appointmentTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#006D65]" />
                          <span>
                            {new Date(appointment.appointmentDate).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                          </span>
                        </div>
                      </div>

                      {appointment.consultationType && (
                        <div className="inline-block">
                          <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 text-blue-700 text-sm sm:text-base rounded-full font-medium border border-blue-200">
                            {appointment.consultationType.name}
                          </span>
                        </div>
                      )}

                      {appointment.notes && (
                        <p className="text-sm sm:text-base text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <span className="font-semibold text-gray-700">Note:</span> {appointment.notes}
                        </p>
                      )}
                    </div>

                    {/* Bouton Terminer */}
                    <button
                      onClick={() => handleCompleteClick(appointment)}
                      className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-[#006D65] text-white rounded-xl hover:bg-[#004d47] transition-all duration-200 text-base sm:text-lg lg:text-xl font-bold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#006D65]/50 w-full lg:w-auto"
                    >
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span>Terminer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Confirmation */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Terminer la consultation
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 text-base sm:text-lg mb-4 sm:mb-6">
              Confirmer que la consultation de{' '}
              <span className="font-bold text-[#006D65]">
                {selectedAppointment.user.firstName} {selectedAppointment.user.lastName}
              </span>{' '}
              est terminée ?
            </p>

            <div className="mb-4 sm:mb-6">
              <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006D65] text-base sm:text-lg"
                rows={4}
                placeholder="Ajouter une note sur la consultation..."
              />
            </div>

            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-base sm:text-lg"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                onClick={handleComplete}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-[#006D65] text-white rounded-lg hover:bg-[#004d47] transition-colors disabled:opacity-50 font-bold text-base sm:text-lg shadow-md"
              >
                {submitting ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer OSIRIX */}
      <div className="text-center space-y-2 mt-8 py-4 sm:py-6 border-t border-gray-200 bg-white">
        <p className="text-xs sm:text-sm text-gray-600 px-4">
          © 2025 <span className="font-semibold text-[#006D65]">OSIRIX</span> - Tous droits réservés
        </p>
      </div>
    </div>
  );
}