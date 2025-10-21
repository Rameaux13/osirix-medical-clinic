import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway
  ) {}

  // Créer une nouvelle notification avec émission temps réel
  async create(createNotificationDto: CreateNotificationDto) {
    const { userId, doctorId, adminId, title, message, type } = createNotificationDto;

    // Vérifier qu'au moins un destinataire est spécifié
    if (!userId && !doctorId && !adminId) {
      throw new BadRequestException('Au moins un destinataire doit être spécifié');
    }

    // Vérifier que les utilisateurs existent
    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Patient non trouvé');
      }
    }

    if (doctorId) {
      const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
      if (!doctor) {
        throw new NotFoundException('Médecin non trouvé');
      }
    }

    if (adminId) {
      const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
      if (!admin) {
        throw new NotFoundException('Administrateur non trouvé');
      }
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: userId || null,
        doctorId: doctorId || null,
        adminId: adminId || null,
        title,
        message,
        type: type || 'general',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // NOUVEAU: Émettre la notification en temps réel
    if (userId) {
      this.notificationsGateway.sendNotificationToUser(userId, notification);
    }
    if (doctorId) {
      this.notificationsGateway.sendNotificationToUser(doctorId, notification);
    }
    if (adminId) {
      this.notificationsGateway.sendNotificationToUser(adminId, notification);
    }

    return {
      message: 'Notification créée et envoyée en temps réel',
      notification,
    };
  }

  // Créer une notification pour tous les patients avec WebSocket
  async createForAllPatients(title: string, message: string, type?: string) {
    const patients = await this.prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    const notifications = await Promise.all(
      patients.map(patient =>
        this.prisma.notification.create({
          data: {
            userId: patient.id,
            title,
            message,
            type: type || 'general',
          },
        })
      )
    );

    // NOUVEAU: Émettre la notification broadcast en temps réel
    this.notificationsGateway.sendNotificationToAllPatients({
      title,
      message,
      type: type || 'general',
      timestamp: new Date(),
    });

    return {
      message: 'Notifications envoyées à tous les patients en temps réel',
      count: notifications.length,
    };
  }

  // Créer une notification pour tous les médecins avec WebSocket
  async createForAllDoctors(title: string, message: string, type?: string) {
    const doctors = await this.prisma.doctor.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    const notifications = await Promise.all(
      doctors.map(doctor =>
        this.prisma.notification.create({
          data: {
            doctorId: doctor.id,
            title,
            message,
            type: type || 'general',
          },
        })
      )
    );

    // NOUVEAU: Émettre la notification broadcast en temps réel
    this.notificationsGateway.sendNotificationToAllDoctors({
      title,
      message,
      type: type || 'general',
      timestamp: new Date(),
    });

    return {
      message: 'Notifications envoyées à tous les médecins en temps réel',
      count: notifications.length,
    };
  }

  // NOUVELLES MÉTHODES: Notifications automatiques pour événements spécifiques

  // Notification automatique lors de la création d'un RDV
  async notifyAppointmentCreated(userId: string, appointment: any) {
  const notification = await this.prisma.notification.create({
    data: {
      userId,
      title: 'Rendez-vous confirmé',
      message: `Votre rendez-vous du ${appointment.appointmentDate.toLocaleDateString('fr-FR')} à ${appointment.appointmentTime} a été confirmé.`,
      type: 'appointment',
    },
  });

  // Émettre SEULEMENT la notification BDD
  this.notificationsGateway.sendNotificationToUser(userId, notification);

  return notification;
}

  // Notification automatique pour les rappels de RDV (24h avant)
  async notifyAppointmentReminder(userId: string, appointment: any) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title: 'Rappel de rendez-vous',
        message: `N'oubliez pas votre rendez-vous demain à ${appointment.appointmentTime}.`,
        type: 'reminder',
      },
    });

    // Émettre en temps réel
    this.notificationsGateway.sendAppointmentNotification(userId, appointment, 'reminder');
    this.notificationsGateway.sendNotificationToUser(userId, notification);

    return notification;
  }

  /// Notification automatique pour l'annulation d'un RDV
async notifyAppointmentCancelled(userId: string, appointment: any, reason?: string) {
  const notification = await this.prisma.notification.create({
    data: {
      userId,
      title: 'Rendez-vous annulé',
      message: `Votre rendez-vous du ${appointment.appointmentDate.toLocaleDateString('fr-FR')} a été annulé.${reason ? ` Raison: ${reason}` : ''}`,
      type: 'appointment',
    },
  });

  // Émettre SEULEMENT la notification BDD (suppression du doublon)
  this.notificationsGateway.sendNotificationToUser(userId, notification);

  return notification;
}

  // Notification automatique pour une nouvelle prescription
  async notifyNewPrescription(userId: string, prescription: any) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title: 'Nouvelle prescription',
        message: 'Une nouvelle prescription a été ajoutée à votre dossier médical.',
        type: 'prescription',
      },
    });

    // Émettre en temps réel
    this.notificationsGateway.sendPrescriptionNotification(userId, prescription);
    this.notificationsGateway.sendNotificationToUser(userId, notification);

    return notification;
  }

  // Notification automatique pour des résultats d'analyses
  async notifyAnalysisResults(userId: string, analysis: any) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title: 'Résultats d\'analyses disponibles',
        message: 'Les résultats de vos analyses sont maintenant disponibles.',
        type: 'lab_result',
      },
    });

    // Émettre en temps réel
    this.notificationsGateway.sendAnalysisResultNotification(userId, analysis);
    this.notificationsGateway.sendNotificationToUser(userId, notification);

    return notification;
  }

  async notifyDocumentUploaded(userId: string, document: any) {
  const notification = await this.prisma.notification.create({
    data: {
      userId,
      title: 'Document ajouté',
      message: `Un nouveau document "${document.title}" a été ajouté à votre dossier.`,
      type: 'general',
    },
  });

  // Émettre SEULEMENT la notification BDD, pas l'événement documentUpdate
  this.notificationsGateway.sendNotificationToUser(userId, notification);

  return notification;
}

  // Message de la clinique
  async notifyClinicMessage(userId: string, message: string, title: string = 'Message de la clinique') {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: 'general',
      },
    });

    // Émettre en temps réel
    this.notificationsGateway.sendNotificationToUser(userId, notification);

    return notification;
  }

  // Récupérer toutes les notifications avec filtres (inchangé)
  async findAll(page: number = 1, limit: number = 10, type?: string, isRead?: boolean) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      message: 'Notifications récupérées',
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // Récupérer les notifications d'un utilisateur (patient) - inchangé
  async findByUser(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      message: 'Notifications du patient',
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // Récupérer les notifications d'un médecin - inchangé
  async findByDoctor(doctorId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { doctorId },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.notification.count({ where: { doctorId } }),
    ]);

    return {
      message: 'Notifications du médecin',
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // Récupérer une notification par ID - inchangé
  async findOne(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException(`Notification avec l'ID ${id} non trouvée`);
    }

    return {
      message: 'Notification trouvée',
      notification,
    };
  }

  // Marquer une notification comme lue avec WebSocket
  async markAsRead(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification avec l'ID ${id} non trouvée`);
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // NOUVEAU: Émettre la mise à jour en temps réel
    if (notification.userId) {
      this.notificationsGateway.server.to(`user_${notification.userId}`).emit('notificationMarkedRead', {
        notificationId: id,
        timestamp: new Date(),
      });
    }

    return {
      message: 'Notification marquée comme lue',
      notification: updatedNotification,
    };
  }

  // Marquer toutes les notifications d'un utilisateur comme lues avec WebSocket
  async markAllAsReadForUser(userId: string) {
    const updatedCount = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // NOUVEAU: Émettre la mise à jour en temps réel
    this.notificationsGateway.server.to(`user_${userId}`).emit('allNotificationsMarkedRead', {
      timestamp: new Date(),
      updatedCount: updatedCount.count,
    });

    return {
      message: 'Toutes les notifications marquées comme lues',
      updatedCount: updatedCount.count,
    };
  }

  // Mettre à jour une notification - inchangé
  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification avec l'ID ${id} non trouvée`);
    }

    const updateData: any = { ...updateNotificationDto };
    if (updateNotificationDto.isRead && !notification.readAt) {
      updateData.readAt = new Date();
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id },
      data: updateData,
    });

    return {
      message: 'Notification mise à jour avec succès',
      notification: updatedNotification,
    };
  }

  // Supprimer une notification - inchangé
  async remove(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification avec l'ID ${id} non trouvée`);
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return {
      message: 'Notification supprimée avec succès',
      deletedNotification: {
        id: notification.id,
        title: notification.title,
      },
    };
  }

  // Compter les notifications non lues d'un utilisateur - inchangé
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return {
      message: 'Nombre de notifications non lues',
      unreadCount: count,
    };
  }

  // Statistiques des notifications - inchangé
  async getStats() {
    const [total, unread, byType] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.count({ where: { isRead: false } }),
      this.prisma.notification.groupBy({
        by: ['type'],
        _count: {
          type: true,
        },
      }),
    ]);

    return {
      message: 'Statistiques des notifications',
      stats: {
        totalNotifications: total,
        unreadNotifications: unread,
        readNotifications: total - unread,
        byType: byType.reduce((acc, item) => {
          acc[item.type || 'general'] = item._count.type;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  }
}