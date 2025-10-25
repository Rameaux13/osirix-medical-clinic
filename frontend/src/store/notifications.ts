import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';

// Types pour les notifications
interface Notification {
  id: string;
  userId: string;
  type: 'appointment' | 'prescription' | 'lab_result' | 'general' | 'reminder';
  title: string;
  message: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  appointmentId?: string;
}

// Types pour les événements WebSocket
interface WebSocketNotification {
  type: 'notification' | 'broadcast' | 'appointment' | 'document' | 'prescription' | 'analysis';
  data: any;
  timestamp: Date;
  appointmentEvent?: 'created' | 'updated' | 'cancelled' | 'reminder';
  action?: 'uploaded' | 'downloaded' | 'deleted';
}

interface NotificationsState {
  // État des notifications
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  // État WebSocket
  socket: Socket | null;
  isConnected: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;

  // Actions
  connect: (token: string) => void;
  disconnect: () => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;

  // Actions internes
  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      // État initial
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,

      // État WebSocket
      socket: null,
      isConnected: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,

      // Connexion WebSocket
      connect: (token: string) => {
        const state = get();

        // Éviter les connexions multiples
        if (state.socket?.connected) {
          return;
        }

        try {
          const socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/notifications`, {
            auth: {
              token: token,
            },
            transports: ['websocket', 'polling'],
            timeout: 20000,
            reconnection: true,
            reconnectionAttempts: state.maxReconnectAttempts,
            reconnectionDelay: 1000,
          });

          // Événement de connexion réussie
          socket.on('connected', (data) => {

            set({
              socket,
              isConnected: true,
              error: null,
              reconnectAttempts: 0
            });
          });

          // Événement de déconnexion
          socket.on('disconnect', (reason) => {

            set({ isConnected: false });

            // Tentative de reconnexion si pas volontaire
            if (reason !== 'io client disconnect') {
              get().incrementReconnectAttempts();
            }
          });

          // Nouvelle notification reçue
          socket.on('newNotification', (data: WebSocketNotification) => {


            const notification: Notification = {
              id: data.data.id || `temp-${Date.now()}`,
              userId: data.data.userId || '',
              type: data.data.type || 'general',
              title: data.data.title || 'Notification',
              message: data.data.message || '',
              isRead: false,
              createdAt: new Date(data.timestamp),
              appointmentId: data.data.appointmentId,
            };

            get().addNotification(notification);

            // Notification browser si supporté
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(notification.title, {
                body: notification.message,
                icon: '/logo.jpg',
                tag: notification.id,
              });
            }
          });

          // Mise à jour spécifique pour les RDV
          socket.on('appointmentUpdate', (data: WebSocketNotification) => {


            let title = 'Mise à jour rendez-vous';
            let message = 'Votre rendez-vous a été mis à jour.';

            switch (data.appointmentEvent) {
              case 'created':
                title = 'Rendez-vous confirmé';
                message = 'Votre rendez-vous a été confirmé avec succès.';
                break;
              case 'cancelled':
                title = 'Rendez-vous annulé';
                message = 'Votre rendez-vous a été annulé.';
                break;
              case 'reminder':
                title = 'Rappel de rendez-vous';
                message = 'N\'oubliez pas votre rendez-vous demain.';
                break;
              case 'updated':
                title = 'Rendez-vous modifié';
                message = 'Les détails de votre rendez-vous ont été modifiés.';
                break;
            }

            const notification: Notification = {
              id: `apt-${Date.now()}`,
              userId: data.data.userId || '',
              type: 'appointment',
              title,
              message,
              isRead: false,
              createdAt: new Date(data.timestamp),
              appointmentId: data.data.id,
            };

            get().addNotification(notification);
          });

          // Mise à jour pour les documents
          socket.on('documentUpdate', (data: WebSocketNotification) => {


            let title = 'Document mis à jour';
            let message = 'Un document a été modifié.';

            switch (data.action) {
              case 'uploaded':
                title = 'Nouveau document';
                message = `Le document "${data.data.title}" a été ajouté.`;
                break;
              case 'downloaded':
                title = 'Document téléchargé';
                message = `Le document "${data.data.title}" a été téléchargé.`;
                break;
              case 'deleted':
                title = 'Document supprimé';
                message = `Le document "${data.data.title}" a été supprimé.`;
                break;
            }

            const notification: Notification = {
              id: `doc-${Date.now()}`,
              userId: data.data.userId || '',
              type: 'general',
              title,
              message,
              isRead: false,
              createdAt: new Date(data.timestamp),
            };

            get().addNotification(notification);
          });

          // Mise à jour pour les prescriptions
          socket.on('prescriptionUpdate', (data: WebSocketNotification) => {


            const notification: Notification = {
              id: `presc-${Date.now()}`,
              userId: data.data.userId || '',
              type: 'prescription',
              title: 'Nouvelle prescription',
              message: 'Une nouvelle prescription a été ajoutée à votre dossier.',
              isRead: false,
              createdAt: new Date(data.timestamp),
            };

            get().addNotification(notification);
          });

          // Mise à jour pour les analyses
          socket.on('analysisUpdate', (data: WebSocketNotification) => {

            const notification: Notification = {
              id: `analysis-${Date.now()}`,
              userId: data.data.userId || '',
              type: 'lab_result',
              title: 'Résultats d\'analyses disponibles',
              message: 'Les résultats de vos analyses sont maintenant disponibles.',
              isRead: false,
              createdAt: new Date(data.timestamp),
            };

            get().addNotification(notification);
          });

          // Notification marquée comme lue
          socket.on('notificationMarkedRead', (data: { notificationId: string }) => {
            set(state => ({
              notifications: state.notifications.map(notif =>
                notif.id === data.notificationId
                  ? { ...notif, isRead: true, readAt: new Date() }
                  : notif
              ),
              unreadCount: Math.max(0, state.unreadCount - 1)
            }));
          });

          // Toutes les notifications marquées comme lues
          socket.on('allNotificationsMarkedRead', () => {
            set(state => ({
              notifications: state.notifications.map(notif => ({
                ...notif,
                isRead: true,
                readAt: new Date()
              })),
              unreadCount: 0
            }));
          });

          // Erreur d'authentification
          socket.on('auth_error', (data) => {

            set({ error: 'Erreur d\'authentification WebSocket', isConnected: false });
            socket.disconnect();
          });

          // Erreur générale
          socket.on('error', (error) => {

            // Ne pas définir d'erreur pour les erreurs vides qui bloquent l'UI
            if (error && Object.keys(error).length > 0) {
              set({ error: 'Erreur de connexion WebSocket' });
            }
          });
          // Ping/Pong pour maintenir la connexion
          socket.on('pong', () => {
            // Connexion maintenue
          });

          // Envoyer un ping périodique
          const pingInterval = setInterval(() => {
            if (socket.connected) {
              socket.emit('ping');
            } else {
              clearInterval(pingInterval);
            }
          }, 30000); // Toutes les 30 secondes

          set({ socket });

        } catch (error) {
          console.error('Erreur lors de la connexion WebSocket:', error);
          set({ error: 'Impossible de se connecter au serveur de notifications' });
        }
      },

      // Déconnexion WebSocket
      disconnect: () => {
        const state = get();
        if (state.socket) {
          state.socket.disconnect();
          set({ socket: null, isConnected: false });
        }
      },

      // Ajouter une notification
      addNotification: (notification: Notification) => {
        set(state => ({
          notifications: [notification, ...state.notifications],
          unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1
        }));
      },

      // Marquer une notification comme lue
      markAsRead: async (id: string) => {
        const token = localStorage.getItem('osirix-token');
        if (!token) return;

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/notifications/${id}/read`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            set(state => ({
              notifications: state.notifications.map(notif =>
                notif.id === id
                  ? { ...notif, isRead: true, readAt: new Date() }
                  : notif
              ),
              unreadCount: Math.max(0, state.unreadCount - 1)
            }));

            // Émettre via WebSocket pour synchroniser les autres onglets
            const socket = get().socket;
            if (socket?.connected) {
              socket.emit('markNotificationRead', { notificationId: id });
            }
          }
        } catch (error) {
          console.error('Erreur lors du marquage de la notification:', error);
          set({ error: 'Erreur lors de la mise à jour de la notification' });
        }
      },

      // Marquer toutes les notifications comme lues
      markAllAsRead: async () => {
        const token = localStorage.getItem('osirix-token');
        if (!token) return;

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/notifications/my-notifications/mark-all-read`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            set(state => ({
              notifications: state.notifications.map(notif => ({
                ...notif,
                isRead: true,
                readAt: new Date()
              })),
              unreadCount: 0
            }));
          }
        } catch (error) {
          console.error('Erreur lors du marquage de toutes les notifications:', error);
          set({ error: 'Erreur lors de la mise à jour des notifications' });
        }
      },

      // Récupérer les notifications depuis l'API
      fetchNotifications: async () => {
        const token = localStorage.getItem('osirix-token');
        if (!token) return;

        set({ loading: true, error: null });

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/notifications/my-notifications?limit=50`,
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
              readAt: notif.readAt ? new Date(notif.readAt) : undefined,
            })) || [];

            const unreadCount = mappedNotifications.filter((n: Notification) => !n.isRead).length;

            set({
              notifications: mappedNotifications,
              unreadCount,
              loading: false
            });
          } else {
            set({ error: 'Erreur lors de la récupération des notifications', loading: false });
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des notifications:', error);
          set({ error: 'Erreur de connexion', loading: false });
        }
      },

      // Vider les notifications
      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      // Supprimer une notification
      removeNotification: (id: string) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id);
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: notification && !notification.isRead
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount
          };
        });
      },

      // Actions internes
      setConnected: (connected: boolean) => set({ isConnected: connected }),
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      incrementReconnectAttempts: () => set(state => ({
        reconnectAttempts: state.reconnectAttempts + 1
      })),
      resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),
    }),
    {
      name: 'osirix-notifications-store',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);

// Hook pour demander la permission de notifications browser
export const useNotificationPermission = () => {
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  return { requestPermission };
};