import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service'; // NOUVEAU
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService // NOUVEAU
  ) { }



  // 🆕 NOUVELLE MÉTHODE - Vérifier la disponibilité des créneaux pour une date
  async getDateAvailability(date: string) {
    try {
      // Récupérer tous les RDV confirmés/programmés pour cette date
      const appointments = await this.prisma.appointment.findMany({
        where: {
          appointmentDate: new Date(date),
          status: {
            in: ['EN_ATTENTE', 'CONFIRMED'] // Exclure les annulés
          }
        },
        select: {
          appointmentTime: true
        }
      });

      // Extraire les heures occupées
      const unavailableSlots = appointments.map(apt => apt.appointmentTime);

      return {
        date,
        unavailableSlots,
        totalOccupied: unavailableSlots.length,
        message: `${unavailableSlots.length} créneaux occupés pour le ${date}`
      };
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la vérification de disponibilité pour le ${date}`);
    }
  }

  // Créer un rendez-vous avec attribution automatique du médecin
  async create(userId: string, createAppointmentDto: CreateAppointmentDto) {
    const { appointmentDate, appointmentTime, consultationTypeId, urgencyLevel, notes, patientForm } = createAppointmentDto;

    // Vérifier que la date n'est pas dans le passé
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    if (appointmentDateTime < new Date()) {
      throw new BadRequestException('Impossible de prendre un rendez-vous dans le passé');
    }

    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // NOUVELLE LOGIQUE : Gérer le type de consultation
    let consultationTypeUuid: string | null = null;
    if (consultationTypeId) {
      // Chercher le type de consultation par nom ou créer s'il n'existe pas
      let consultationType = await this.prisma.consultationType.findFirst({
        where: { name: consultationTypeId }
      });

      // Si le type n'existe pas, le créer
      if (!consultationType) {
        consultationType = await this.prisma.consultationType.create({
          data: {
            name: consultationTypeId,
            description: `Type de consultation: ${consultationTypeId}`,
            isActive: true
          }
        });
      }

      consultationTypeUuid = consultationType.id;
    }

    // 🔥 VÉRIFICATION AMÉLIORÉE - Conflit de créneaux
    const existingAppointmentAtSlot = await this.prisma.appointment.findFirst({
      where: {
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        status: {
          not: 'cancelled',
        },
      },
    });

    if (existingAppointmentAtSlot) {
      throw new ConflictException('Ce créneau horaire est déjà occupé. Veuillez choisir une autre heure.');
    }

    // Vérifier si l'utilisateur a déjà un RDV à cette date/heure
    const existingUserAppointment = await this.prisma.appointment.findFirst({
      where: {
        userId,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        status: {
          not: 'cancelled',
        },
      },
    });

    if (existingUserAppointment) {
      throw new ConflictException('Vous avez déjà un rendez-vous à cette date et heure');
    }

    // Trouver ou créer un créneau disponible
    let slot = await this.findOrCreateSlot(appointmentDate, appointmentTime);

    // Vérifier si le créneau est disponible
    if (slot.currentAppointments >= slot.maxAppointments) {
      throw new ConflictException('Ce créneau est complet');
    }

    // Attribution automatique d'un médecin disponible
    const availableDoctor = await this.findAvailableDoctor(appointmentDate, appointmentTime);

    // Créer le rendez-vous
    const newAppointment = await this.prisma.appointment.create({
      data: {
        userId,
        doctorId: availableDoctor?.id || null,
        consultationTypeId: consultationTypeUuid, // Utiliser l'UUID correct
        slotId: slot.id,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        status: 'EN_ATTENTE',
        paymentStatus: 'pending',
        amount: 50.0,
        urgencyLevel: urgencyLevel || 'normal',
        notes: notes || null,

        // Données du formulaire patient
        chiefComplaint: patientForm?.chiefComplaint || null,
        symptoms: patientForm?.symptoms || null,
        painLevel: patientForm?.painLevel || null,
        painLocation: patientForm?.painLocation || null,
        symptomsDuration: patientForm?.symptomsDuration || null,
        medicalHistory: patientForm?.medicalHistory || null,
        currentMedications: patientForm?.currentMedications || null,
        allergies: patientForm?.allergies || null,
        familyMedicalHistory: patientForm?.familyMedicalHistory || null,
        lifestyleInfo: patientForm?.lifestyleInfo || null,
        additionalInfo: patientForm?.additionalInfo || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            speciality: true,
          },
        },
        consultationType: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // Mettre à jour le nombre de RDV dans le créneau
    await this.prisma.appointmentSlot.update({
      where: { id: slot.id },
      data: {
        currentAppointments: slot.currentAppointments + 1,
        isAvailable: slot.currentAppointments + 1 < slot.maxAppointments,
      },
    });

    // 🆕 NOUVEAU : Notification automatique de création de RDV
    try {
      await this.notificationsService.notifyAppointmentCreated(userId, newAppointment);
    } catch (error) {
      console.warn('Erreur notification RDV:', error);
      // Ne pas bloquer la création du RDV si la notification échoue
    }
    return {
      message: 'Rendez-vous créé avec succès',
      appointment: {
        id: newAppointment.id,
        appointmentDate: newAppointment.appointmentDate,
        appointmentTime: newAppointment.appointmentTime,
        status: newAppointment.status,
        urgencyLevel: newAppointment.urgencyLevel,
        amount: newAppointment.amount,
        createdAt: newAppointment.createdAt,
      },
      nextSteps: [
        '✅ Votre rendez-vous est confirmé',
        '💳 Procédez au paiement pour finaliser la réservation',
        '📧 Vous recevrez une confirmation par email',
        '🏥 Un médecin vous sera attribué le jour J'
      ],
    };
  }

  // Trouver ou créer un créneau de 30 minutes
  private async findOrCreateSlot(date: string, time: string) {
    // Chercher un créneau existant
    let slot = await this.prisma.appointmentSlot.findFirst({
      where: {
        date: new Date(date),
        startTime: time,
      },
    });

    // Si pas de créneau, en créer un
    if (!slot) {
      const startTime = time;
      const endTime = this.calculateEndTime(time, 30); // 30 minutes par défaut

      slot = await this.prisma.appointmentSlot.create({
        data: {
          date: new Date(date),
          startTime,
          endTime,
          maxAppointments: 1, // 1 RDV par créneau par défaut
          currentAppointments: 0,
          isAvailable: true,
        },
      });
    }

    return slot;
  }

  // Calculer l'heure de fin (ajouter des minutes)
  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  // Trouver un médecin disponible (attribution intelligente)
  private async findAvailableDoctor(date: string, time: string) {
    // Récupérer tous les médecins actifs
    const doctors = await this.prisma.doctor.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        speciality: true,
      },
    });

    if (doctors.length === 0) {
      return null;
    }

    // Pour l'instant, attribution aléatoire simple
    // TODO: Améliorer avec logique de disponibilité et charge de travail
    const randomIndex = Math.floor(Math.random() * doctors.length);
    return doctors[randomIndex];
  }

  // Récupérer tous les RDV avec filtres et pagination
  async findAll(page: number = 1, limit: number = 10, status?: string, urgencyLevel?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (urgencyLevel) where.urgencyLevel = urgencyLevel;

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
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
              phone: true,
            },
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              speciality: true,
            },
          },
          consultationType: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: {
          appointmentDate: 'asc',
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      message: 'Liste des rendez-vous récupérée',
      appointments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalAppointments: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // Récupérer les RDV d'un patient
  async findByUser(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              speciality: true,
            },
          },
          consultationType: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: {
          appointmentDate: 'desc',
        },
      }),
      this.prisma.appointment.count({ where: { userId } }),
    ]);

    return {
      message: 'Rendez-vous du patient récupérés',
      appointments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalAppointments: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // Récupérer un RDV par ID
  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            speciality: true,
          },
        },
        consultationType: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous avec l'ID ${id} non trouvé`);
    }

    return {
      message: 'Rendez-vous trouvé',
      appointment,
    };
  }

  // Mettre à jour un RDV
  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous avec l'ID ${id} non trouvé`);
    }

    // Préparer les données de mise à jour
    const updateData: any = { ...updateAppointmentDto };

    // Gérer les dates
    if (updateAppointmentDto.appointmentDate) {
      updateData.appointmentDate = new Date(updateAppointmentDto.appointmentDate);
    }

    // Gérer le formulaire patient
    if (updateAppointmentDto.patientForm) {
      const form = updateAppointmentDto.patientForm;
      updateData.chiefComplaint = form.chiefComplaint;
      updateData.symptoms = form.symptoms;
      updateData.painLevel = form.painLevel;
      updateData.painLocation = form.painLocation;
      updateData.symptomsDuration = form.symptomsDuration;
      updateData.medicalHistory = form.medicalHistory;
      updateData.currentMedications = form.currentMedications;
      updateData.allergies = form.allergies;
      updateData.familyMedicalHistory = form.familyMedicalHistory;
      updateData.lifestyleInfo = form.lifestyleInfo;
      updateData.additionalInfo = form.additionalInfo;
      delete updateData.patientForm;
    }

    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            speciality: true,
          },
        },
        consultationType: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return {
      message: 'Rendez-vous mis à jour avec succès',
      appointment: updatedAppointment,
    };
  }

  // Annuler un RDV
  // Annuler un RDV (juste après la méthode update)
  async cancel(id: string, reason?: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { slot: true },
    });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous avec l'ID ${id} non trouvé`);
    }

    if (appointment.status === 'cancelled') {
      throw new BadRequestException('Ce rendez-vous est déjà annulé');
    }

    // Annuler le RDV
    const cancelledAppointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'cancelled',
        notes: reason ? `Annulé: ${reason}` : 'Annulé',
      },
    });

    // Libérer le créneau
    if (appointment.slot) {
      await this.prisma.appointmentSlot.update({
        where: { id: appointment.slot.id },
        data: {
          currentAppointments: Math.max(0, appointment.slot.currentAppointments - 1),
          isAvailable: true,
        },
      });
    }
    // Notification d'annulation
    try {
      await this.notificationsService.notifyAppointmentCancelled(appointment.userId, cancelledAppointment, reason);
    } catch (error) {
      console.warn('Erreur notification annulation:', error);
    }

    return {
      message: 'Rendez-vous annulé avec succès',
      appointment: cancelledAppointment,
    };
  }

  // Supprimer définitivement un RDV (seulement si annulé)
  async permanentDelete(id: string, userId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous avec l'ID ${id} non trouvé`);
    }

    // Vérifier que c'est le propriétaire
    if (appointment.userId !== userId) {
      throw new BadRequestException('Vous ne pouvez supprimer que vos propres rendez-vous');
    }

    // Vérifier que le RDV est bien annulé
    if (appointment.status !== 'cancelled') {
      throw new BadRequestException('Seuls les rendez-vous annulés peuvent être supprimés définitivement');
    }

    // Supprimer définitivement
    await this.prisma.appointment.delete({
      where: { id }
    });

    return {
      message: 'Rendez-vous supprimé définitivement avec succès'
    };
  }
  // Générer des créneaux automatiquement (tâche cron)
  async generateTimeSlots(startDate: Date, endDate: Date) {
    const slotsCreated: any[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      // Générer des créneaux de 8h à 18h par jour
      for (let hour = 8; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

          // Vérifier si le créneau existe déjà
          const existingSlot = await this.prisma.appointmentSlot.findFirst({
            where: {
              date: new Date(current),
              startTime: timeString,
            },
          });

          if (!existingSlot) {
            const endTime = this.calculateEndTime(timeString, 30);

            const slot = await this.prisma.appointmentSlot.create({
              data: {
                date: new Date(current),
                startTime: timeString,
                endTime,
                maxAppointments: 1,
                currentAppointments: 0,
                isAvailable: true,
              },
            });

            slotsCreated.push(slot);
          }
        }
      }

      // Passer au jour suivant
      current.setDate(current.getDate() + 1);
    }

    return {
      message: 'Créneaux générés avec succès',
      slotsCreated: slotsCreated.length,
      period: `${startDate.toISOString().split('T')[0]} à ${endDate.toISOString().split('T')[0]}`,
    };
  }

  // Statistiques des RDV
  async getStats() {
    const [total, scheduled, completed, cancelled, urgent, emergency] = await Promise.all([
      this.prisma.appointment.count(),
      this.prisma.appointment.count({ where: { status: 'scheduled' } }),
      this.prisma.appointment.count({ where: { status: 'completed' } }),
      this.prisma.appointment.count({ where: { status: 'cancelled' } }),
      this.prisma.appointment.count({ where: { urgencyLevel: 'urgent' } }),
      this.prisma.appointment.count({ where: { urgencyLevel: 'emergency' } }),
    ]);

    return {
      message: 'Statistiques des rendez-vous',
      stats: {
        totalAppointments: total,
        scheduledAppointments: scheduled,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
        urgentAppointments: urgent,
        emergencyAppointments: emergency,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
      },
    };
  }
  // ========================================
  // 🆕 MÉTHODES SECRÉTAIRE
  // ========================================

  /**
   * Récupérer tous les RDV en attente (pour la secrétaire)
   */
  async getPendingAppointments() {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: 'EN_ATTENTE',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        consultationType: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Les plus anciens en premier
      },
    });

    return {
      message: 'Rendez-vous en attente récupérés',
      count: appointments.length,
      appointments,
    };
  }

  /**
   * Récupérer tous les RDV avec filtres avancés (pour la secrétaire)
   */
  async getAllAppointmentsForSecretary(
    status?: string,
    date?: string,
    patientSearch?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status && status !== 'TOUS') {
      where.status = status;
    }

    if (date) {
      where.appointmentDate = new Date(date);
    }

    // ✅ SANS mode: 'insensitive' (SQLite ne le supporte pas)
    if (patientSearch) {
      where.user = {
        OR: [
          { firstName: { contains: patientSearch } },
          { lastName: { contains: patientSearch } },
          { email: { contains: patientSearch } },
        ],
      };
    }

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
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
              phone: true,
            },
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              speciality: true,
            },
          },
          consultationType: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { appointmentDate: 'asc' },
          { appointmentTime: 'asc' },
        ],
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      message: 'Liste des rendez-vous récupérée',
      appointments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Confirmer un RDV (par la secrétaire)
   */
  async confirmAppointment(id: string, notes?: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous avec l'ID ${id} non trouvé`);
    }

    if (appointment.status !== 'EN_ATTENTE') {
      throw new BadRequestException(
        `Ce rendez-vous est déjà ${appointment.status}. Impossible de le confirmer.`,
      );
    }

    // Confirmer le RDV
    const confirmedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        notes: notes || appointment.notes,
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

    // Envoyer notification au patient
    try {
      await this.notificationsService.create({
        userId: appointment.userId,
        title: '✅ Rendez-vous confirmé',
        message: `Votre rendez-vous du ${new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')} à ${appointment.appointmentTime} a été confirmé par notre secrétariat.`,
        type: 'appointment',
      });
    } catch (error) {
      console.warn('Erreur notification confirmation:', error);
    }

    return {
      message: 'Rendez-vous confirmé avec succès',
      appointment: confirmedAppointment,
    };
  }

  /**
   * Annuler un RDV (par la secrétaire)
   */
  async cancelBySecretary(id: string, reason?: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { slot: true, user: true },
    });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous avec l'ID ${id} non trouvé`);
    }

    if (appointment.status === 'cancelled') {
      throw new BadRequestException('Ce rendez-vous est déjà annulé');
    }

    // Annuler le RDV
    const cancelledAppointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'cancelled',
        notes: reason
          ? `Annulé par secrétariat: ${reason}`
          : 'Annulé par secrétariat',
      },
    });

    // Libérer le créneau
    if (appointment.slot) {
      await this.prisma.appointmentSlot.update({
        where: { id: appointment.slot.id },
        data: {
          currentAppointments: Math.max(
            0,
            appointment.slot.currentAppointments - 1,
          ),
          isAvailable: true,
        },
      });
    }

    // Notification d'annulation
    try {
      await this.notificationsService.create({
        userId: appointment.userId,
        title: '❌ Rendez-vous annulé',
        message: `Votre rendez-vous du ${new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')} à ${appointment.appointmentTime} a été annulé. ${reason ? `Raison: ${reason}` : ''}`,
        type: 'appointment',
      });
    } catch (error) {
      console.warn('Erreur notification annulation:', error);
    }

    return {
      message: 'Rendez-vous annulé avec succès',
      appointment: cancelledAppointment,
    };
  }

  async completeAppointment(id: string, notes?: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous avec l'ID ${id} non trouvé`);
    }

    if (appointment.status !== 'CONFIRMED') {
      throw new BadRequestException(
        'Seuls les rendez-vous confirmés peuvent être marqués comme terminés',
      );
    }

    const completedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'TERMINE',
        notes: notes || appointment.notes,
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

    // Notification au patient
    try {
      await this.notificationsService.create({
        userId: appointment.userId,
        title: '✅ Consultation terminée',
        message: `Merci d'être venu à la clinique OSIRIX. Votre consultation du ${new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')} est terminée.`,
        type: 'appointment',
      });
    } catch (error) {
      console.warn('Erreur notification terminé:', error);
    }

    return {
      message: 'Rendez-vous marqué comme terminé',
      appointment: completedAppointment,
    };
  }

  /**
 * Récupérer les statistiques pour le dashboard secrétaire
 */
  async getSecretaryStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      pendingAppointments,
      todayAppointments,
      confirmedAppointments,
      totalPatients,
    ] = await Promise.all([
      // RDV en attente
      this.prisma.appointment.count({
        where: { status: 'EN_ATTENTE' },
      }),

      // RDV du jour
      this.prisma.appointment.count({
        where: {
          appointmentDate: {
            gte: today,
            lt: tomorrow,
          },
          status: { not: 'cancelled' },
        },
      }),

      // RDV confirmés
      this.prisma.appointment.count({
        where: { status: 'CONFIRMED' },
      }),

      // Total patients
      this.prisma.user.count({
        where: {
          role: 'PATIENT',
        },
      }),
    ]);

    return {
      pendingAppointments,
      todayAppointments,
      totalPatients,
      confirmedAppointments,
    };
  }

}