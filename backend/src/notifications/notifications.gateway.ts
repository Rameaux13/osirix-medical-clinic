import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

interface AuthenticatedSocket extends Socket {
  userId: string;
  userType: 'patient' | 'doctor' | 'admin';
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<string, AuthenticatedSocket>();

  constructor(private jwtService: JwtService) { }

  // Connexion d'un client
  async handleConnection(client: AuthenticatedSocket) {
    try {
      this.logger.log(`Client tentative de connexion: ${client.id}`);

      // Extraire le token du handshake
      let token = client.handshake.auth?.token;
      if (!token) {
        const authHeader = client.handshake.headers?.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        this.logger.warn(`Connexion refusée - pas de token: ${client.id}`);
        client.disconnect();
        return;
      }

      // Vérifier le token JWT
      const payload = await this.jwtService.verifyAsync(token);
      this.logger.log(`Token payload: ${JSON.stringify(payload)}`); // DEBUG

      client.userId = payload.sub || payload.userId || payload.id;
      client.userType = payload.userType || payload.type || 'patient';

      this.logger.log(`userId final: ${client.userId}, userType: ${client.userType}`); // DEBUG

      // Stocker la connexion
      this.connectedUsers.set(client.userId, client);

      // Joindre le client à sa room personnelle
      await client.join(`user_${client.userId}`);

      // Joindre le client à la room de son type d'utilisateur
      await client.join(`${client.userType}s`);

      this.logger.log(`Utilisateur connecté: ${client.userId} (${client.userType})`);

      // Confirmer la connexion
      client.emit('connected', {
        message: 'Connexion WebSocket établie',
        userId: client.userId,
        userType: client.userType,
      });

    } catch (error) {
      this.logger.error(`Erreur d'authentification WebSocket: ${error.message}`);
      client.emit('auth_error', { message: 'Token invalide' });
      client.disconnect();
    }
  }

  // Déconnexion d'un client
  handleDisconnect(client: Socket) {
    const authenticatedClient = client as AuthenticatedSocket;
    if (authenticatedClient.userId) {
      this.connectedUsers.delete(authenticatedClient.userId);
      this.logger.log(`Utilisateur déconnecté: ${authenticatedClient.userId}`);
    } else {
      this.logger.log(`Client déconnecté sans userId: ${client.id}`);
    }
  }

  // Écouter les demandes de rejoindre une room spécifique
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string }
  ) {
    client.join(data.room);
    client.emit('joinedRoom', { room: data.room });
    this.logger.log(`Client ${client.userId} a rejoint la room: ${data.room}`);
  }

  // Méthodes pour envoyer des notifications

  // Envoyer une notification à un utilisateur spécifique
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('newNotification', {
      type: 'notification',
      data: notification,
      timestamp: new Date(),
    });

    this.logger.log(`Notification envoyée à l'utilisateur ${userId}: ${notification.title}`);
  }

  // Envoyer une notification à tous les patients
  sendNotificationToAllPatients(notification: any) {
    this.server.to('patients').emit('newNotification', {
      type: 'broadcast',
      data: notification,
      timestamp: new Date(),
    });

    this.logger.log(`Notification broadcast envoyée à tous les patients: ${notification.title}`);
  }

  // Envoyer une notification à tous les médecins
  sendNotificationToAllDoctors(notification: any) {
    this.server.to('doctors').emit('newNotification', {
      type: 'broadcast',
      data: notification,
      timestamp: new Date(),
    });

    this.logger.log(`Notification broadcast envoyée à tous les médecins: ${notification.title}`);
  }

  // Envoyer une notification à tous les admins
  sendNotificationToAllAdmins(notification: any) {
    this.server.to('admins').emit('newNotification', {
      type: 'broadcast',
      data: notification,
      timestamp: new Date(),
    });

    this.logger.log(`Notification broadcast envoyée à tous les admins: ${notification.title}`);
  }

  // Notification spéciale pour les rendez-vous
  sendAppointmentNotification(userId: string, appointment: any, type: 'created' | 'updated' | 'cancelled' | 'reminder') {
    const notification = {
      type: 'appointment',
      appointmentEvent: type,
      data: appointment,
      timestamp: new Date(),
    };

    this.server.to(`user_${userId}`).emit('appointmentUpdate', notification);
    this.logger.log(`Notification RDV envoyée à ${userId}: ${type}`);
  }

  // Notification pour les documents
  sendDocumentNotification(userId: string, document: any, action: 'uploaded' | 'downloaded' | 'deleted') {
    const notification = {
      type: 'document',
      action,
      data: document,
      timestamp: new Date(),
    };

    this.server.to(`user_${userId}`).emit('documentUpdate', notification);
    this.logger.log(`Notification document envoyée à ${userId}: ${action}`);
  }

  // Notification pour les prescriptions
  sendPrescriptionNotification(userId: string, prescription: any) {
    const notification = {
      type: 'prescription',
      data: prescription,
      timestamp: new Date(),
    };

    this.server.to(`user_${userId}`).emit('prescriptionUpdate', notification);
    this.logger.log(`Notification prescription envoyée à ${userId}`);
  }

  // Notification pour les résultats d'analyses
  sendAnalysisResultNotification(userId: string, analysis: any) {
    const notification = {
      type: 'analysis',
      data: analysis,
      timestamp: new Date(),
    };

    this.server.to(`user_${userId}`).emit('analysisUpdate', notification);
    this.logger.log(`Notification analyse envoyée à ${userId}`);
  }

  // Méthodes utilitaires

  // Vérifier si un utilisateur est connecté
  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Obtenir le nombre d'utilisateurs connectés
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Obtenir les utilisateurs connectés par type
  getConnectedUsersByType(userType: 'patient' | 'doctor' | 'admin'): string[] {
    const users: string[] = [];
    this.connectedUsers.forEach((socket, userId) => {
      if (socket.userType === userType) {
        users.push(userId);
      }
    });
    return users;
  }

  // Ping pour maintenir la connexion
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: new Date() });
  }

  // Marquer une notification comme lue (temps réel)
  @SubscribeMessage('markNotificationRead')
  handleMarkNotificationRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: string }
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Utilisateur non authentifié' });
      return;
    }

    // Émettre à tous les clients de cet utilisateur (si plusieurs onglets ouverts)
    this.server.to(`user_${client.userId}`).emit('notificationMarkedRead', {
      notificationId: data.notificationId,
      timestamp: new Date(),
    });
  }
}