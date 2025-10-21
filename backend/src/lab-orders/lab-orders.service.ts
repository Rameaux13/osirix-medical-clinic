import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LabOrder, Prisma } from '@prisma/client';

@Injectable()
export class LabOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // Récupérer toutes les analyses d'un patient
  async getMyAnalyses(userId: string): Promise<LabOrder[]> {
    try {
      const labOrders = await this.prisma.labOrder.findMany({
        where: { userId },
        include: {
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          consultation: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          orderDate: 'desc',
        },
      });

      return labOrders;
    } catch (error) {
      console.error('Erreur lors de la récupération des analyses:', error);
      throw new Error('Impossible de récupérer les analyses');
    }
  }

  // Récupérer une analyse spécifique par ID
  async getAnalysisById(id: string, userId: string): Promise<LabOrder> {
    try {
      const labOrder = await this.prisma.labOrder.findUnique({
        where: { id },
        include: {
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          consultation: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!labOrder) {
        throw new NotFoundException('Analyse non trouvée');
      }

      // Vérifier que l'analyse appartient bien au patient
      if (labOrder.userId !== userId) {
        throw new ForbiddenException('Accès non autorisé à cette analyse');
      }

      return labOrder;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Erreur lors de la récupération de l\'analyse:', error);
      throw new Error('Impossible de récupérer l\'analyse');
    }
  }

  // Statistiques des analyses pour le patient
  async getAnalysesStats(userId: string) {
    try {
      const stats = await this.prisma.labOrder.groupBy({
        by: ['status'],
        where: { userId },
        _count: {
          status: true,
        },
      });

      const total = await this.prisma.labOrder.count({
        where: { userId },
      });

      const recentAnalyses = await this.prisma.labOrder.count({
        where: {
          userId,
          orderDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 derniers jours
          },
        },
      });

      return {
        total,
        recentAnalyses,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.status;
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      throw new Error('Impossible de calculer les statistiques');
    }
  }

  // Récupérer les analyses récentes (pour le dashboard)
  async getRecentAnalyses(userId: string, limit: number = 3): Promise<LabOrder[]> {
    try {
      const recentAnalyses = await this.prisma.labOrder.findMany({
        where: { userId },
        include: {
          doctor: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          orderDate: 'desc',
        },
        take: limit,
      });

      return recentAnalyses;
    } catch (error) {
      console.error('Erreur lors de la récupération des analyses récentes:', error);
      throw new Error('Impossible de récupérer les analyses récentes');
    }
  }

  // Méthode pour les médecins : récupérer les analyses qu'ils ont prescrites
  async getMyCreatedAnalyses(doctorId: string): Promise<LabOrder[]> {
    try {
      const labOrders = await this.prisma.labOrder.findMany({
        where: { doctorId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          consultation: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          orderDate: 'desc',
        },
      });

      return labOrders;
    } catch (error) {
      console.error('Erreur lors de la récupération des analyses créées:', error);
      throw new Error('Impossible de récupérer les analyses créées');
    }
  }

  // Mettre à jour le statut d'une analyse (pour les médecins)
  async updateAnalysisStatus(
    id: string,
    doctorId: string,
    updateData: { status?: string; results?: string; resultsDate?: Date; resultFiles?: any[] }
  ): Promise<LabOrder> {
    try {
      const existingAnalysis = await this.prisma.labOrder.findUnique({
        where: { id },
      });

      if (!existingAnalysis) {
        throw new NotFoundException('Analyse non trouvée');
      }

      if (existingAnalysis.doctorId !== doctorId) {
        throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cette analyse');
      }

      const updatedAnalysis = await this.prisma.labOrder.update({
        where: { id },
        data: updateData,
        include: {
          doctor: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return updatedAnalysis;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Erreur lors de la mise à jour de l\'analyse:', error);
      throw new Error('Impossible de mettre à jour l\'analyse');
    }
  }

  // =====================================================
  // 🆕 MÉTHODE SECRÉTAIRE
  // =====================================================

  /**
   * Envoyer une analyse à un patient (par la secrétaire)
   * Sans consultation liée (créé directement par le secrétariat)
   */
  async sendLabOrderToPatient(sendLabOrderDto: any, secretaryId?: string) {
    const { userId, examType, orderDate, instructions, results, resultFiles } = sendLabOrderDto;

    // Vérifier que le patient existe
    const patient = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!patient) {
      throw new NotFoundException(`Patient avec l'ID ${userId} non trouvé`);
    }

    // Vérifier que le patient a bien le rôle PATIENT
    if (patient.role !== 'PATIENT') {
      throw new ForbiddenException('Vous ne pouvez envoyer des analyses qu\'aux patients');
    }

    // Créer l'analyse sans consultation (créée par secrétaire)
    const labOrder = await this.prisma.labOrder.create({
      data: {
        userId,
        consultationId: null,  // ✅ Null
        doctorId: null, // Pas de médecin assigné
        examType,
        orderDate: new Date(orderDate),
        instructions: instructions || null,
        status: 'completed', // Directement complété car résultats fournis
        results: results || null,
        resultFiles: resultFiles || null,
        resultsDate: new Date(), // Date d'aujourd'hui
        priority: 'normal',
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

    return {
      message: 'Analyse envoyée au patient avec succès',
      labOrder,
    };
  }
  
}