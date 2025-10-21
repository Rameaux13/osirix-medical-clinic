'use client';

// React et autres imports
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useCurrentUser } from '@/store/auth';
import useMyAppointments from '@/hooks/useMyAppointments';
import { useNotificationsStore, useNotificationPermission } from '@/store/notifications';
import PrendreRDVForm from '../../components/PrendreRDVForm';
import MesRDVList from '../../components/MesRDVList';
import MesDocuments from '../../components/MesDocuments';
import documentService from '../../../services/documentService';
import type { DocumentStats } from '../../../services/documentService';
import prescriptionService from '../../../services/prescriptionService';
import type { Prescription } from '../../../services/prescriptionService';
import MesAnalyses from '../../components/MesAnalyses';
import MonProfil from '../../components/MonProfil';
import ChatAssistant from '../../components/ChatAssistant';

import axios from 'axios';

// Composants d'icônes SVG natifs
const Bell = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const Calendar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const User = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Star = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const MessageSquare = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const Clock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Stethoscope = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const Activity = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const BookOpen = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const ChevronLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const MessageCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Send = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const LogOut = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default function DashboardPatient() {
  const router = useRouter();

  // HOOKS CORRECTEMENT ORGANISÉS
  const { isAuthenticated, userType, logout, token } = useAuthStore();
  const { user, displayName } = useCurrentUser();

  // WebSocket Notifications Store
  const {
    notifications: webSocketNotifications,
    unreadCount,
    isConnected,
    loading: notificationsLoading,
    error: notificationsError,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotificationsStore();

  // Permission notifications browser
  const { requestPermission } = useNotificationPermission();

  // Hook appointments existant
  const {
    appointments,
    dashboardStats,
    notifications,
    loading,
    markNotificationAsRead,
    refetch,
  } = useMyAppointments({ includeDashboardData: true });

  // ÉTATS DU COMPOSANT
  const [activeSection, setActiveSection] = useState('dashboard');
  const [clinicRating, setClinicRating] = useState(0);
  const [consultationRating, setConsultationRating] = useState(0);
  const [clinicComment, setClinicComment] = useState('');
  const [consultationComment, setConsultationComment] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [documentStats, setDocumentStats] = useState<DocumentStats | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewMessageType, setReviewMessageType] = useState<'success' | 'error' | ''>('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);
  const [prescriptionError, setPrescriptionError] = useState<string | null>(null);



  // État pour le calendrier
  const [currentDate, setCurrentDate] = useState(new Date());

  // État pour les tooltips
  const [hoveredDate, setHoveredDate] = useState<{ day: number, appointment: any } | null>(null);
  const [mounted, setMounted] = useState(false);

  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);

  // EFFECTS
  // Redirection si non connecté
  const [authChecked, setAuthChecked] = useState(false);

  // Vérification authentification avec délai
  useEffect(() => {
    const checkAuth = setTimeout(() => {
      setAuthChecked(true);

      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Redirection si mauvais type d'utilisateur
      if (userType !== 'patient') {
        switch (userType) {
          case 'doctor':
            router.push('/dashboard/doctor');
            break;
          case 'admin':
            router.push('/dashboard/admin');
            break;
          default:
            router.push('/login');
        }
      }
    }, 100); // Petit délai pour laisser le store se charger

    return () => clearTimeout(checkAuth);
  }, [isAuthenticated, userType, router]);

  // Initialisation WebSocket et notifications
  useEffect(() => {
    if (isAuthenticated && token && user) {
      connect(token);
      fetchNotifications();
      requestPermission();

      return () => {
        disconnect();
      };
    }
  }, [isAuthenticated, token, user]);

  // Chargement des stats documents
  useEffect(() => {
    if (user) {
      loadDocumentStats();
    }
    setMounted(true);
  }, [user]);



  // FONCTIONS
  const handleLogout = () => {
    disconnect(); // Déconnecter WebSocket
    logout();
    router.push('/');
  };

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Activity },
    { id: 'appointments', label: 'Mes RDV', icon: Calendar },
    { id: 'new-appointment', label: 'Prendre RDV', icon: Clock },
    { id: 'analyses', label: 'Analyses', icon: Stethoscope },
    { id: 'documents', label: 'Documents', icon: FileText },

  ];



  // 3. FONCTION DE CHARGEMENT DES PRESCRIPTIONS
  const loadPrescriptions = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingPrescriptions(true);
      setPrescriptionError(null);

      const response = await prescriptionService.getMyPrescriptions();
      setPrescriptions(response.data);

    } catch (error: any) {
      console.error('Erreur chargement prescriptions:', error);
      setPrescriptionError(error.message);
    } finally {
      setLoadingPrescriptions(false);
    }
  }, [user]);

  // Fonction pour soumettre un avis clinique
  const handleSubmitClinicReview = async () => {
    if (clinicRating === 0) {
      setReviewMessage('Veuillez donner une note avant d\'envoyer votre avis');
      setReviewMessageType('error');
      setTimeout(() => setReviewMessage(''), 3000);
      return;
    }

    setSubmittingReview(true);
    setReviewMessage('');

    try {
      // Vérifier que le token existe
      if (!token) {
        throw new Error('Token manquant - veuillez vous reconnecter');
      }

      console.log('Token utilisé:', token?.substring(0, 20) + '...'); // Debug

      const response = await axios.post(
        'http://localhost:3001/reviews/clinic',
        {
          rating: clinicRating,
          comment: clinicComment.trim() || undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setReviewMessage(response.data.message);
        setReviewMessageType('success');

        // Réinitialiser le formulaire après succès
        setClinicRating(0);
        setClinicComment('');

        // Masquer le message après 5 secondes
        setTimeout(() => setReviewMessage(''), 5000);

        // Pas de refresh automatique ici - laisser le WebSocket gérer
      }

    } catch (error: any) {
      console.error('Erreur envoi avis:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);

      let errorMessage = 'Erreur lors de l\'envoi de votre avis';

      if (error.response?.status === 401) {
        errorMessage = 'Session expirée, veuillez vous reconnecter';
        // Optionnel : forcer la reconnexion
        // handleLogout();
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (!navigator.onLine) {
        errorMessage = 'Pas de connexion internet';
      }

      setReviewMessage(errorMessage);
      setReviewMessageType('error');

      // Masquer le message d'erreur après 5 secondes
      setTimeout(() => setReviewMessage(''), 5000);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Fonction pour obtenir les détails d'un RDV par date
  const getAppointmentForDate = (day: number | null) => {
    if (!day || !appointments) return null;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toDateString();
    return appointments.find((apt: any) =>
      apt.status !== 'cancelled' &&
      apt.appointmentDate.toDateString() === dateStr
    );
  };

  // Gérer le clic sur une date avec RDV
  const handleDateClick = (day: number | null) => {
    const appointment = getAppointmentForDate(day);
    if (appointment) {
      setActiveSection('appointments');
    }
  };

  // Fonctions du calendrier
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Convertir le jour de la semaine pour que lundi soit 0 (au lieu de dimanche = 0)
    let startingDayOfWeek = firstDay.getDay();
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const days = [];

    // Jours vides au début
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  // Gérer le clic sur une notification
  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }

    // Redirection selon le type de notification
    if (notification.type === 'appointment' && notification.appointmentId) {
      setActiveSection('appointments');
    }
  };

  // Fonction pour gérer le clic sur une notification WebSocket
  const handleWebSocketNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Redirection selon le type de notification
    if (notification.type === 'appointment' && notification.appointmentId) {
      setActiveSection('appointments');
    } else if (notification.type === 'prescription') {
      setActiveSection('dashboard');
    } else if (notification.type === 'lab_result') {
      setActiveSection('analyses');
    }
  };

  const loadDocumentStats = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingDocuments(true);
      const stats = await documentService.getDocumentStats();
      setDocumentStats(stats);
    } catch (error) {
      console.error('Erreur chargement stats documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  }, [user]);

  // === FONCTION DE REFRESH DES DONNÉES DASHBOARD ===
  const refreshDashboardData = useCallback(async () => {
    try {
      if (user) {
        console.log('🔄 Rechargement des données dashboard...');
        await refetch(); // Recharger les RDV
        // Appel direct sans callback
        const stats = await documentService.getDocumentStats();
        setDocumentStats(stats);
      }
    } catch (error) {
      console.error('Erreur refresh dashboard:', error);
    }
  }, [user, refetch]); // Retirer loadDocumentStats


  // === ÉCOUTE DES NOTIFICATIONS POUR REFRESH AUTOMATIQUE ===
  useEffect(() => {
    if (!webSocketNotifications || webSocketNotifications.length === 0 || !user) return;

    const lastNotification = webSocketNotifications[0];
    if (lastNotification.isRead) return;

    const notificationTime = new Date(lastNotification.createdAt);
    const now = new Date();
    const timeDiff = (now.getTime() - notificationTime.getTime()) / 1000;

    if (timeDiff < 10) {
      console.log('🔄 Nouvelle notification détectée, refresh des données...');

      // Utiliser une fonction simple sans référence aux callbacks
      const refreshTimeout = setTimeout(() => {
        if (lastNotification.type === 'appointment') {
          // Appel direct sans dépendance
          refetch();
        } else if (lastNotification.type === 'general' &&
          lastNotification.message.toLowerCase().includes('document')) {
          // Appel direct pour documents
          documentService.getDocumentStats().then(setDocumentStats).catch(console.error);
        }
      }, 800);

      return () => clearTimeout(refreshTimeout);
    }
  }, [webSocketNotifications, user, refetch]); // Seules les dépendances stables


  // === AUTO-REFRESH INTELLIGENT DU DASHBOARD (CORRIGÉ) ===
useEffect(() => {
  // Ne rafraîchir QUE si on est sur le dashboard
  if (activeSection !== 'dashboard' || !isAuthenticated || !user) return;

  const refreshInterval = setInterval(() => {
    console.log('🔄 Auto-refresh dashboard...');
    refetch();
    documentService.getDocumentStats().then(setDocumentStats).catch(console.error);
  }, 60000); // 60 secondes au lieu de 30

  return () => clearInterval(refreshInterval);
}, [activeSection, isAuthenticated, user, refetch]);


  // 4. USEEFFECT POUR CHARGER AU MONTAGE (ajouter avec les autres useEffect)
  useEffect(() => {
    if (user) {
      loadPrescriptions();
    }
  }, [user, loadPrescriptions]);

  {/* Début Section : Mes Prescriptions */ }
  const renderPrescriptionsSection = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-2xl">Mes Prescriptions</h3>
          <Stethoscope className="w-6 h-6 text-[#006D65]" />
        </div>

        {/* État de chargement */}
        {loadingPrescriptions && (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        )}

        {/* Message d'erreur */}
        {prescriptionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 text-base">{prescriptionError}</p>
            </div>
          </div>
        )}

        {/* Pas de chargement et pas d'erreur */}
        {!loadingPrescriptions && !prescriptionError && (
          <>
            {/* Si prescriptions existent */}
            {prescriptions.length > 0 ? (
              <div className="space-y-4">
                {/* Compteur */}
                <div className="bg-gradient-to-r from-[#006D65]/5 via-gray-50 to-[#E6A930]/5 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#006D65] to-[#005a54] rounded-xl flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-base text-gray-600 mb-1">Prescriptions actives</p>
                        <p className="text-2xl font-semibold text-[#006D65]">
                          {prescriptions.filter(p => p.isActive).length} prescription{prescriptions.filter(p => p.isActive).length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-green-600 mb-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium">Médecin vérifié</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liste des prescriptions récentes */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 text-lg mb-3">Prescriptions récentes</h4>
                  {prescriptions.slice(0, 3).map((prescription) => (
                    <div key={prescription.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-gradient-to-r from-white to-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Date et médecin */}
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-base text-gray-600">
                              {prescriptionService.formatPrescriptionDate(prescription.prescriptionDate)}
                            </p>
                            {prescription.doctor && (
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-[#006D65] rounded-full flex items-center justify-center">
                                  <User className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm text-gray-700 font-medium">
                                  Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Médicaments */}
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2">Médicaments prescrits :</p>
                            <div className="space-y-1">
                              {prescriptionService.parseMedications(prescription.medications).slice(0, 2).map((med, index) => (
                                <div key={index} className="text-sm bg-gray-100 rounded-lg px-3 py-2">
                                  <span className="font-medium text-gray-900">{med.name}</span>
                                  <span className="text-gray-600 ml-2">- {med.dosage} {med.frequency}</span>
                                </div>
                              ))}
                              {prescriptionService.parseMedications(prescription.medications).length > 2 && (
                                <p className="text-xs text-gray-500 italic">
                                  +{prescriptionService.parseMedications(prescription.medications).length - 2} autre(s) médicament(s)
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Instructions */}
                          {prescription.instructions && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-1">Instructions :</p>
                              <p className="text-sm text-gray-800 bg-blue-50 rounded-lg p-2 border-l-4 border-blue-200">
                                {prescription.instructions}
                              </p>
                            </div>
                          )}

                          {/* Status */}
                          <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${prescription.isActive
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}>
                              {prescription.isActive ? 'Active' : 'Expirée'}
                            </span>

                            <button className="text-[#006D65] hover:text-[#005a54] text-sm font-medium transition-colors">
                              Voir détails →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Voir toutes les prescriptions */}
                  {prescriptions.length > 3 && (
                    <div className="text-center mt-4">
                      <button className="text-[#006D65] hover:text-[#005a54] font-medium text-base transition-colors">
                        Voir toutes mes prescriptions ({prescriptions.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Aucune prescription */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-lg text-gray-600 mb-2">Aucune prescription disponible</p>
                <p className="text-base text-gray-500">Vos prescriptions médicales apparaîtront ici</p>
              </div>
            )}
          </>
        )}
      </div>
    );
  };
  {/* Fin Section : Mes Prescriptions */ }

  // Fonction de gestion du clic sur une notification avec redirection intelligente
  const handleNotificationRedirect = async (notification: any) => {
    // Marquer comme lu
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Fermer le menu
    setNotificationMenuOpen(false);

    // Redirection intelligente
    switch (notification.type) {
      case 'appointment':
        setActiveSection('appointments');
        break;
      case 'general':
        // Si le message contient "document", rediriger vers documents
        if (notification.message.toLowerCase().includes('document')) {
          setActiveSection('documents');
        }
        break;
      case 'prescription':
        setActiveSection('dashboard');
        break;
      case 'lab_result':
        setActiveSection('analyses');
        break;
      default:
        setActiveSection('dashboard');
    }

    // Refresh APRÈS la redirection (en dehors du if)
    setTimeout(() => {
      refreshDashboardData();
    }, 500);
  };

  // Rendu conditionnel
  if (!mounted || !authChecked) {
    return null; // Pas de rendu côté serveur ou pendant vérification auth
  }

  if (!isAuthenticated || userType !== 'patient') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006D65] mx-auto mb-4"></div>
          <p className="text-gray-700 text-base">{"Vérification de l'authentification..."}</p>
        </div>
      </div>
    );
  }

  const renderStarRating = (rating: number, setRating: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`text-2xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-400'
              } hover:text-yellow-400`}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  const renderDashboardContent = () => {
    // État de chargement
    if (loading) {
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Début Section : Mes Informations */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-5">Mes Informations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section informations de base - Police agrandie */}
            <div className="bg-gradient-to-br from-[#006D65]/5 to-white rounded-xl p-5 border border-[#006D65]/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#006D65] rounded-full flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Informations Patient</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-base text-gray-600 mb-1">Nom complet</p>
                  <p className="font-semibold text-gray-900 text-lg">{displayName}</p>
                </div>
                <div>
                  <p className="text-base text-gray-600 mb-1">Email</p>
                  <p className="font-semibold text-gray-900 text-lg">{user?.email}</p>
                </div>
                <div>
                  <p className="text-base text-gray-600 mb-1">Téléphone</p>
                  <p className="font-semibold text-gray-900 text-lg">{user?.phone || 'Non renseigné'}</p>
                </div>
              </div>
            </div>

            {/* Cercle avec image docteur + Textes à droite */}
<div className="flex items-center gap-6">
  {/* Cercle image - décalé vers la gauche */}
  <div className="relative w-48 h-48 flex-shrink-0">
    <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#006D65] shadow-lg">
      <img
        src="/docteur.jpg"
        alt="Médecin OSIRIX"
        className="w-full h-full object-cover"
      />
    </div>
  </div>
  
  {/* Textes à droite du cercle */}
  <div className="flex-1">
    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Bienvenue chez OSIRIX</h3>
    <p className="text-gray-700 text-lg">Votre santé est notre priorité.</p>
  </div>
</div>
          </div>
        </div>
        {/* Fin Section : Mes Informations */}


        {/* Section Mes Rendez-vous */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-2xl">Mes Rendez-vous</h3>
            <Calendar className="w-6 h-6 text-[#006D65]" />
          </div>

          {/* Calendrier Mini avec vraies données */}
          <div className="mb-6">
            {/* Header du calendrier */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h4 className="font-medium text-gray-900 text-xl">
                {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </h4>
              <button
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                <div key={index} className="text-base font-medium text-gray-500 text-center p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Grille du calendrier - Police agrandie */}
            <div className="grid grid-cols-7 gap-1 relative">
              {getDaysInMonth(currentDate).map((day, index) => {
                const appointment = getAppointmentForDate(day);
                const hasAppointment = !!appointment;
                const isToday = day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <div key={index} className="relative flex justify-center">
                    <div
                      onClick={() => handleDateClick(day)}
                      onMouseEnter={() => appointment && setHoveredDate({ day: day!, appointment })}
                      onMouseLeave={() => setHoveredDate(null)}
                      className={`
                        h-11 w-11 flex items-center justify-center text-base rounded-xl transition-all duration-200 font-medium
                        ${!day ? '' :
                          hasAppointment ? 'bg-[#006D65] text-white shadow-md hover:shadow-lg hover:scale-105 cursor-pointer' :
                            isToday ? 'bg-[#E6A930] text-white shadow-md' :
                              'hover:bg-gray-100 text-gray-700 cursor-pointer hover:scale-105'
                        }
                      `}
                    >
                      {day}
                    </div>

                    {/* Tooltip au survol - Amélioré */}
                    {hoveredDate && hoveredDate.day === day && appointment && (
                      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-10 bg-gray-900 text-white text-sm rounded-lg py-3 px-4 shadow-lg min-w-max">
                        <div className="font-medium text-base">{appointment.consultationType?.name || 'Consultation'}</div>
                        <div className="text-gray-300 text-base">{appointment.appointmentTime}</div>
                        {appointment.doctor && (
                          <div className="text-gray-300 text-sm">
                            Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                          </div>
                        )}
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Légende */}
            <div className="mt-3 flex items-center justify-center space-x-4 text-base">
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-[#E6A930] rounded"></div>
                <span className="text-gray-600">Aujourd'hui</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-[#006D65] rounded"></div>
                <span className="text-gray-600">RDV</span>
              </div>
            </div>
          </div>

          {/* Prochain RDV - Police agrandie et suppression des prix */}
          <div className="border-t border-gray-200 pt-5">
            <h4 className="font-medium text-gray-900 text-xl mb-4">Prochain RDV</h4>
            {dashboardStats?.nextAppointment ? (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 border-l-4 border-l-[#006D65] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-lg mb-2">
                      {dashboardStats.nextAppointment.consultationType?.name || 'Consultation'}
                    </p>
                    <p className="text-gray-700 text-xl mb-3">
                      {dashboardStats.nextAppointment.appointmentDate.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })} à {dashboardStats.nextAppointment.appointmentTime}
                    </p>
                    {dashboardStats.nextAppointment.doctor && (
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-[#006D65] rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-gray-700 text-xl font-medium">
                          Dr. {dashboardStats.nextAppointment.doctor.firstName} {dashboardStats.nextAppointment.doctor.lastName}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="bg-[#006D65] text-white px-4 py-2 rounded-full text-lg font-medium">
                        Confirmé
                      </span>
                      <button
                        onClick={() => setActiveSection('appointments')}
                        className="text-[#006D65] hover:text-[#005a54] text-xl font-semibold transition-colors"
                      >
                        Voir détails →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-600 mb-4 text-xl">Aucun rendez-vous programmé</p>
                <button
                  onClick={() => setActiveSection('new-appointment')}
                  className="bg-[#E6A930] text-white py-3 px-6 rounded-xl hover:bg-[#d49821] transition-colors font-semibold text-lg shadow-md hover:shadow-lg"
                >
                  Prendre RDV
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Fin Section : Mes Rendez-vous */}





        {/* Début Section : Mes Prescriptions */}
        {renderPrescriptionsSection()}
        {/* Fin Section : Mes Prescriptions */}

        {/* Début Section : Mes Documents */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold text-gray-900 text-3xl">Mes Documents</h3>
            <div className="w-12 h-12 bg-[#006D65]/10 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-[#006D65]" />
            </div>
          </div>

          {loadingDocuments ? (
            <div className="animate-pulse space-y-5">
              <div className="h-20 bg-gray-200 rounded-xl"></div>
              <div className="flex gap-4">
                <div className="h-12 bg-gray-200 rounded-lg flex-1"></div>
                <div className="h-12 bg-gray-200 rounded-lg flex-1"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Compteur principal - Version agrandie */}
              <div className="bg-gradient-to-r from-[#006D65]/5 via-gray-50 to-[#E6A930]/5 rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#006D65] to-[#005a54] rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-lg text-gray-600 mb-2 font-medium">Documents stockés</p>
                      <p className="text-3xl font-semibold text-[#006D65]">
                        {documentStats?.totalDocuments || 0} document{(documentStats?.totalDocuments || 0) > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-green-600 mb-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm font-semibold">Sécurisé</span>
                    </div>
                    <p className="text-xs text-gray-500">Chiffrement SSL</p>
                  </div>
                </div>
              </div>

              {/* Actions agrandies et responsives */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setActiveSection('documents')}
                  className="flex items-center justify-center px-6 py-4 bg-[#006D65] text-white rounded-xl hover:bg-[#005a54] transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex-1 group"
                >
                  <FileText className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                  <span>Voir mes documents</span>
                </button>

                <button
                  onClick={() => setActiveSection('documents')}
                  className="flex items-center justify-center px-6 py-4 bg-[#E6A930] text-white rounded-xl hover:bg-[#d4941a] transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex-1 group"
                >
                  <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Importer nouveau</span>
                </button>
              </div>

              {/* Information stylisée */}
              <div className="text-center bg-gray-50 rounded-lg py-3 px-4">
                <p className="text-sm text-gray-600 font-medium">
                  Formats acceptés : 📄 PDF • 🖼️ Images • 📝 Word • 📊 Excel
                </p>
                <p className="text-xs text-gray-500 mt-1">Taille maximale : 10MB par fichier</p>
              </div>
            </div>
          )}
        </div>
        {/* Fin Section : Mes Documents */}

        {/* Début Section : Mes Prochains Rendez-vous */}
        {dashboardStats?.upcomingAppointments?.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">Mes Prochains Rendez-vous</h3>
              <Calendar className="w-6 h-6 text-[#006D65]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardStats.upcomingAppointments.slice(0, 6).map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:border-[#006D65] bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg mb-2">
                        {appointment.consultationType?.name || 'Consultation'}
                      </h4>
                      <p className="text-lg text-gray-600 font-medium">
                        {appointment.appointmentDate.toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#006D65] mb-1">
                        {appointment.appointmentTime}
                      </p>
                    </div>
                  </div>

                  {appointment.doctor && (
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-[#006D65] rounded-full flex items-center justify-center shadow-md">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                        </p>
                        {appointment.doctor.speciality && (
                          <p className="text-base text-gray-600">{appointment.doctor.speciality}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className={`text-base px-3 py-2 rounded-full font-semibold ${appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                      {appointment.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                    </span>
                    <button
                      onClick={() => setActiveSection('appointments')}
                      className="text-lg text-[#006D65] hover:text-[#005a54] font-bold transition-colors"
                    >
                      Détails →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {dashboardStats.upcomingAppointments.length > 6 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setActiveSection('appointments')}
                  className="text-[#006D65] hover:text-[#005a54] font-bold text-xl transition-colors"
                >
                  Voir tous mes rendez-vous ({dashboardStats.upcomingAppointments.length})
                </button>
              </div>
            )}
          </div>
        )}
        {/* Fin Section : Mes Prochains Rendez-vous */}

        {/* Début Section : Noter la Clinique OSIRIX */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-6 h-6 text-[#E6A930] mr-2" />
            Noter la Clinique OSIRIX
          </h3>

          {/* Message de feedback */}
          {reviewMessage && (
            <div className={`mb-4 p-4 rounded-lg border ${reviewMessageType === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
              }`}>
              <div className="flex items-center">
                {reviewMessageType === 'success' ? (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <p className="font-medium text-base">{reviewMessage}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div>
              <p className="text-lg text-gray-700 mb-2">Votre satisfaction générale</p>
              {renderStarRating(clinicRating, setClinicRating)}
              <textarea
                value={clinicComment}
                onChange={(e) => setClinicComment(e.target.value)}
                placeholder="Partagez votre expérience avec la clinique..."
                className="mt-3 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent resize-none text-lg"
                rows={3}
                disabled={submittingReview}
              />
              <button
                onClick={handleSubmitClinicReview}
                disabled={submittingReview || clinicRating === 0}
                className="mt-3 bg-[#006D65] text-white py-2 px-6 rounded-lg hover:bg-[#005a54] transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submittingReview ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer mon avis'
                )}
              </button>

              {/* Note explicative */}
              <p className="mt-2 text-sm text-gray-600">
                * Votre avis sera envoyé par email à la clinique et nous aidera à améliorer nos services.
              </p>
            </div>
          </div>
        </div>
        {/* Fin Section : Noter la Clinique OSIRIX */}

      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboardContent();
      case 'appointments':
        return <MesRDVList onNavigateToNewAppointment={() => setActiveSection('new-appointment')} />;
      case 'new-appointment':
        return <PrendreRDVForm />;
      case 'analyses':
        return <MesAnalyses onNavigateToNewAppointment={() => setActiveSection('new-appointment')} />;
      case 'documents':
        return <MesDocuments />;
      case 'profile':
        return <MonProfil />;
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Début Section : Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Texte OSIRIX - Desktop uniquement (sans logo) */}
            <div className="hidden lg:flex items-center">
              <h1 className="text-xl xl:text-2xl font-bold text-[#006D65] tracking-wide">
                OSIRIX
              </h1>
            </div>

            {/* Logo mobile uniquement */}
            <div className="lg:hidden flex items-center">
              <div className="flex items-center space-x-3">
                <img
                  src="/logo.jpg"
                  alt="Logo OSIRIX"
                  className="h-10 w-10 object-cover rounded-lg shadow-sm"
                />
                <div>
                  <h1 className="text-xl font-bold text-[#006D65]">OSIRIX</h1>
                </div>
              </div>
            </div>

            {/* Navigation Horizontale (Centre) - Desktop uniquement avec indicateur vert */}
            <nav className="hidden lg:flex space-x-1 flex-1 justify-center max-w-4xl mx-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center px-3 xl:px-4 py-2 text-sm xl:text-base font-medium transition-all duration-200 ${activeSection === item.id
                      ? 'text-[#006D65] font-bold'
                      : 'text-gray-700 hover:text-[#006D65]'
                      }`}
                  >
                    <Icon className="w-4 h-4 xl:mr-2" />
                    <span className="hidden xl:block">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Profil Utilisateur + Actions (Droite) */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Notifications avec menu déroulant */}
              <div className="relative">
                <button
                  onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-gray-700 hover:text-[#006D65]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Menu déroulant notifications */}
                {notificationMenuOpen && (
                  <>
                    {/* Overlay pour fermer en cliquant à côté */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setNotificationMenuOpen(false)}
                    />

                    {/* Menu notifications */}
                    <div className="absolute right-0 top-12 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                      {/* Header */}
                      <div className="bg-[#006D65] text-white p-4 rounded-t-xl">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-lg">Notifications</h3>
                          <span className="bg-white/20 text-sm px-2 py-1 rounded-full">
                            {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Actions rapides */}
                      <div className="p-3 border-b border-gray-200 flex gap-2">
                        <button
                          onClick={() => {
                            markAllAsRead();
                            setNotificationMenuOpen(false);
                          }}
                          disabled={unreadCount === 0}
                          className="flex-1 text-sm bg-[#006D65] text-white py-2 px-3 rounded-lg hover:bg-[#005a54] transition-colors disabled:opacity-50 font-medium"
                        >
                          Tout marquer lu
                        </button>

                      </div>

                      {/* Liste notifications */}
                      <div className="max-h-64 overflow-y-auto">
                        {webSocketNotifications && webSocketNotifications.length > 0 ? (
                          webSocketNotifications.slice(0, 8).map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationRedirect(notification)}
                              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''
                                }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-1">
                                    <h4 className={`font-semibold text-base ${!notification.isRead ? 'text-blue-900' : 'text-gray-800'
                                      }`}>
                                      {notification.title}
                                    </h4>
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                                    )}
                                  </div>
                                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                      {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${notification.type === 'appointment' ? 'bg-green-100 text-green-800' :
                                      notification.type === 'prescription' ? 'bg-purple-100 text-purple-800' :
                                        notification.type === 'lab_result' ? 'bg-blue-100 text-blue-800' :
                                          'bg-gray-100 text-gray-800'
                                      }`}>
                                      {notification.type === 'appointment' ? 'RDV' :
                                        notification.type === 'prescription' ? 'Prescription' :
                                          notification.type === 'lab_result' ? 'Analyses' : 'Général'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center">
                            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">Aucune notification</p>
                            <p className="text-sm text-gray-500 mt-1">Vous serez notifié des mises à jour</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profil Utilisateur - CLIQUABLE */}
              <button
                onClick={() => setActiveSection('profile')}
                className="flex items-center space-x-2 lg:space-x-3 p-1 lg:p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none"
                title="Voir mon profil"
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-[#006D65] to-[#005a54] rounded-full flex items-center justify-center shadow-md">
                  <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[120px] lg:max-w-none">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-600">Patient</p>
                </div>
              </button>
              {/* Icône de déconnexion - Desktop */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5 text-gray-700 hover:text-[#006D65]" />
              </button>

              {/* Menu hamburger mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Fin Section : Navbar */}

      {/* Début Section : Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white shadow-lg rounded-b-2xl border-t border-gray-200 z-40">
          <div className="px-4 py-6 space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
            {/* Profil utilisateur mobile */}
            <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#006D65] to-[#005a54] rounded-full flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-base">{displayName}</p>
                <p className="text-sm text-gray-600">Patient OSIRIX</p>
              </div>
            </div>

            {/* Navigation - Utilisation uniquement de couleurs comme indicateur */}
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-left transition-colors ${activeSection === item.id
                      ? 'text-[#006D65] font-bold'
                      : 'text-gray-800 hover:text-[#006D65]'
                      }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium text-base">{item.label}</span>
                  </button>
                );
              })}
            </div>


          </div>
        </div>
      )}
      {/* Fin Section : Menu Mobile */}

      {/* Zone Principale */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>

      {/* Chat Assistant */}
      <ChatAssistant onNavigate={(section) => setActiveSection(section)} />
    </div>

  );
}