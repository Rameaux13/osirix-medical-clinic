import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/auth';

// Types basés sur ton DTO backend
interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  speciality?: string;
}

interface ConsultationType {
  id: string;
  name: string;
  description?: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface Appointment {
  id: string;
  userId: string;
  doctorId?: string;
  consultationTypeId?: string;
  slotId?: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: string;
  paymentStatus: string;
  amount: number;
  urgencyLevel: string;
  notes?: string;
  
  // Données du formulaire patient
  chiefComplaint?: string;
  symptoms?: string;
  painLevel?: number;
  painLocation?: string;
  symptomsDuration?: string;
  medicalHistory?: string;
  currentMedications?: string;
  allergies?: string;
  familyMedicalHistory?: string;
  lifestyleInfo?: string;
  additionalInfo?: string;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
  doctor?: Doctor;
  consultationType?: ConsultationType;
}

// NOUVEAU: Type pour les notifications
interface Notification {
  id: string;
  userId: string;
  type: 'appointment' | 'prescription' | 'analysis' | 'urgent' | 'general';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  appointmentId?: string;
}

interface ApiResponse {
  message: string;
  appointments: Appointment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalAppointments: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// NOUVEAU: Type pour les données du dashboard
interface DashboardStats {
  upcomingCount: number;
  pastCount: number;
  cancelledCount: number;
  totalCount: number;
  nextAppointment: Appointment | null;
  upcomingAppointments: Appointment[];
  unreadNotifications: number;
  hasAppointmentToday: boolean;
}

interface UseMyAppointmentsProps {
  page?: number;
  limit?: number;
  status?: 'upcoming' | 'past' | 'cancelled' | 'all';
  autoFetch?: boolean;
  includeDashboardData?: boolean; // NOUVEAU: Pour activer les données dashboard
}

interface UseMyAppointmentsReturn {
  appointments: Appointment[];
  filteredAppointments: {
    upcoming: Appointment[];
    past: Appointment[];
    cancelled: Appointment[];
  };
  loading: boolean;
  error: string | null;
  pagination: ApiResponse['pagination'] | null;
  refetch: () => Promise<void>;
  updateAppointment: (id: string, data: any) => Promise<void>;
  cancelAppointment: (id: string, reason?: string) => Promise<void>;
  deleteAppointmentPermanent: (id: string) => Promise<void>;
  
  // NOUVEAU: Données dashboard
  dashboardStats: DashboardStats;
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  hasAppointmentOnDate: (date: Date) => boolean;
}

export default function useMyAppointments({ 
  page = 1, 
  limit = 10,
  status = 'all',
  autoFetch = true,
  includeDashboardData = false // NOUVEAU
}: UseMyAppointmentsProps = {}): UseMyAppointmentsReturn {
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ApiResponse['pagination'] | null>(null);
  
  // NOUVEAU: État pour les notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState<boolean>(false);
  
  const { token } = useAuthStore();

  // Fonction pour récupérer les RDV depuis l'API
  const fetchMyAppointments = useCallback(async () => {
    if (!token) {
      setError('Vous devez être connecté');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/appointments/my-appointments?page=1&limit=100`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      
      // Mapper les dates depuis les strings
      const mappedAppointments = data.appointments.map(apt => ({
        ...apt,
        appointmentDate: new Date(apt.appointmentDate),
        createdAt: new Date(apt.createdAt),
        updatedAt: new Date(apt.updatedAt),
      }));

      setAppointments(mappedAppointments);
      setPagination(data.pagination);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // NOUVEAU: Fonction pour récupérer les notifications
  const fetchNotifications = useCallback(async () => {
    if (!token) {
      return;
    }

    setNotificationsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/notifications`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const mappedNotifications = data.notifications?.map((notif: any) => ({
          ...notif,
          createdAt: new Date(notif.createdAt),
        })) || [];
        setNotifications(mappedNotifications);
      }
    } catch (err) {
    } finally {
      setNotificationsLoading(false);
    }
  }, [token]);

  // NOUVEAU: Marquer une notification comme lue
  const markNotificationAsRead = useCallback(async (id: string) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/notifications/${id}/mark-read`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (err) {
    }
  }, [token]);

  // Auto-fetch au chargement du hook
  useEffect(() => {
    if (autoFetch) {
      fetchMyAppointments();
      if (includeDashboardData) {
        fetchNotifications();
      }
    }
  }, [fetchMyAppointments, fetchNotifications, autoFetch, includeDashboardData]);

  // Fonction pour mettre à jour un RDV
  const updateAppointment = useCallback(async (id: string, updateData: any) => {
    if (!token) {
      setError('Vous devez être connecté');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/appointments/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour: ${response.statusText}`);
      }

      await fetchMyAppointments();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de mise à jour');
    }
  }, [token, fetchMyAppointments]);

  // Fonction pour annuler un RDV
  const cancelAppointment = useCallback(async (id: string, reason?: string) => {
    if (!token) {
      setError('Vous devez être connecté');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/appointments/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de l'annulation: ${response.statusText}`);
      }

      await fetchMyAppointments();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur d\'annulation');
    }
  }, [token, fetchMyAppointments]);

  // Fonction pour supprimer définitivement un RDV annulé
  const deleteAppointmentPermanent = useCallback(async (id: string) => {
    if (!token) {
      setError('Vous devez être connecté');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/appointments/${id}/permanent`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la suppression: ${response.statusText}`);
      }

      await fetchMyAppointments();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de suppression');
    }
  }, [token, fetchMyAppointments]);

  // Filtrer les RDV par statut et date
  const filteredAppointments = useMemo(() => {
    return {
      upcoming: appointments.filter(apt => {
        const appointmentDate = new Date(apt.appointmentDate);
        const today = new Date();
        
        const appointmentDay = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
        const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        return (
          apt.status !== 'cancelled' && 
          appointmentDay >= todayDay
        );
      }).sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()),

      past: appointments.filter(apt => {
        const appointmentDate = new Date(apt.appointmentDate);
        const today = new Date();
        
        const appointmentDay = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
        const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        return (
          apt.status !== 'cancelled' && 
          appointmentDay < todayDay
        );
      }).sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()),

      cancelled: appointments.filter(apt => apt.status === 'cancelled')
        .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()),
    };
  }, [appointments]);

  // NOUVEAU: Calculer les statistiques du dashboard
  const dashboardStats = useMemo<DashboardStats>(() => {
    const today = new Date();
    const todayStr = today.toDateString();
    
    return {
      upcomingCount: filteredAppointments.upcoming.length,
      pastCount: filteredAppointments.past.length,
      cancelledCount: filteredAppointments.cancelled.length,
      totalCount: appointments.length,
      nextAppointment: filteredAppointments.upcoming[0] || null,
      upcomingAppointments: filteredAppointments.upcoming.slice(0, 5), // Les 5 prochains
      unreadNotifications: notifications.filter(n => !n.isRead).length,
      hasAppointmentToday: filteredAppointments.upcoming.some(apt => 
        apt.appointmentDate.toDateString() === todayStr
      ),
    };
  }, [filteredAppointments, notifications, appointments]);

  // NOUVEAU: Fonction pour vérifier si une date a un RDV
  const hasAppointmentOnDate = useCallback((date: Date): boolean => {
    const dateStr = date.toDateString();
    return appointments.some(apt => 
      apt.status !== 'cancelled' && 
      apt.appointmentDate.toDateString() === dateStr
    );
  }, [appointments]);

  return {
    appointments,
    filteredAppointments,
    loading: loading || notificationsLoading,
    error,
    pagination,
    refetch: fetchMyAppointments,
    updateAppointment,
    cancelAppointment,
    deleteAppointmentPermanent,
    
    // NOUVEAU: Données dashboard
    dashboardStats,
    notifications,
    fetchNotifications,
    markNotificationAsRead,
    hasAppointmentOnDate,
  };
}