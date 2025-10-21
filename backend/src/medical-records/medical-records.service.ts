import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import type { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MedicalRecordsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}
  // Créer un nouveau dossier médical
  async create(createMedicalRecordDto: CreateMedicalRecordDto) {
    const { userId, doctorId, consultationId, recordType, title, content, fileUrl, fileName, fileSize, fileType, isVisibleToPatient, tags } = createMedicalRecordDto;

    // Vérifier que l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Patient non trouvé');
    }

    // Vérifier que le médecin existe (si fourni)
    if (doctorId) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { id: doctorId },
      });

      if (!doctor) {
        throw new NotFoundException('Médecin non trouvé');
      }
    }

    // Créer l'enregistrement médical
    const newRecord = await this.prisma.medicalRecord.create({
      data: {
        userId,
        doctorId: doctorId || null,
        consultationId: consultationId || null,
        recordType,
        title,
        content: content || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
        fileType: fileType || null,
        isVisibleToPatient: isVisibleToPatient ?? true,
        tags: tags || null,
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
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            speciality: true,
          },
        },
      },
    });
 // 🆕 NOUVEAU : Notification automatique d'upload de document
    try {
      await this.notificationsService.notifyDocumentUploaded(userId, newRecord);
    } catch (error) {
      console.warn('Erreur notification document:', error);
      // Ne pas bloquer l'upload si la notification échoue
    }
    
    return {
      message: 'Dossier médical créé avec succès',
      record: newRecord,
    };
  }

  // Récupérer tous les dossiers médicaux avec filtres
  async findAll(page: number = 1, limit: number = 10, recordType?: string, userId?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (recordType) where.recordType = recordType;
    if (userId) where.userId = userId;

    const [records, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
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
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              speciality: true,
            },
          },
        },
        orderBy: {
          recordDate: 'desc',
        },
      }),
      this.prisma.medicalRecord.count({ where }),
    ]);

    return {
      message: 'Dossiers médicaux récupérés',
      records,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // Récupérer le carnet médical d'un patient (visible au patient)
  async findByPatient(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where: { 
          userId,
          isVisibleToPatient: true 
        },
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
        },
        orderBy: {
          recordDate: 'desc',
        },
      }),
      this.prisma.medicalRecord.count({ 
        where: { 
          userId,
          isVisibleToPatient: true 
        } 
      }),
    ]);

    return {
      message: 'Carnet médical du patient',
      records,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // Récupérer les dossiers par type
  async findByType(recordType: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where: { recordType },
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
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              speciality: true,
            },
          },
        },
        orderBy: {
          recordDate: 'desc',
        },
      }),
      this.prisma.medicalRecord.count({ where: { recordType } }),
    ]);

    return {
      message: `Dossiers de type ${recordType}`,
      records,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // Récupérer un dossier par ID
  async findOne(id: string) {
    const record = await this.prisma.medicalRecord.findUnique({
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
      },
    });

    if (!record) {
      throw new NotFoundException(`Dossier médical avec l'ID ${id} non trouvé`);
    }

    return {
      message: 'Dossier médical trouvé',
      record,
    };
  }

  // Mettre à jour un dossier médical
  async update(id: string, updateMedicalRecordDto: UpdateMedicalRecordDto) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Dossier médical avec l'ID ${id} non trouvé`);
    }

    const updatedRecord = await this.prisma.medicalRecord.update({
      where: { id },
      data: updateMedicalRecordDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
      },
    });

    return {
      message: 'Dossier médical mis à jour avec succès',
      record: updatedRecord,
    };
  }

  // Supprimer un dossier médical (version sécurisée)
  async remove(id: string, userId?: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Document avec l'ID ${id} non trouvé`);
    }

    // Si un userId est fourni (patient), vérifier qu'il est propriétaire
    if (userId && record.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres documents');
    }

    // Supprimer le fichier physique si il existe
    if (record.fileUrl) {
      const filePath = join(process.cwd(), record.fileUrl);
      try {
        if (existsSync(filePath)) {
          const fs = require('fs');
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.warn('Erreur lors de la suppression du fichier physique:', error);
        // Ne pas bloquer la suppression de l'enregistrement BDD
      }
    }

    await this.prisma.medicalRecord.delete({
      where: { id },
    });

    return {
      message: 'Document supprimé avec succès',
      deletedDocument: {
        id: record.id,
        title: record.title,
        recordType: record.recordType,
        fileName: record.fileName,
      },
    };
  }

  // Rechercher dans les dossiers médicaux
  async search(query: string, userId?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const where: any = {
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
        { tags: { contains: query } },
      ],
    };

    if (userId) {
      where.userId = userId;
    }

    const [records, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
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
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              speciality: true,
            },
          },
        },
        orderBy: {
          recordDate: 'desc',
        },
      }),
      this.prisma.medicalRecord.count({ where }),
    ]);

    return {
      message: `Résultats de recherche pour "${query}"`,
      records,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // Statistiques des dossiers médicaux
  async getStats() {
    const [total, consultations, prescriptions, labResults, documents, uploads] = await Promise.all([
      this.prisma.medicalRecord.count(),
      this.prisma.medicalRecord.count({ where: { recordType: 'consultation' } }),
      this.prisma.medicalRecord.count({ where: { recordType: 'prescription' } }),
      this.prisma.medicalRecord.count({ where: { recordType: 'lab_result' } }),
      this.prisma.medicalRecord.count({ where: { recordType: 'document' } }),
      this.prisma.medicalRecord.count({ where: { recordType: 'upload' } }),
    ]);

    return {
      message: 'Statistiques des dossiers médicaux',
      stats: {
        totalRecords: total,
        consultationRecords: consultations,
        prescriptionRecords: prescriptions,
        labResultRecords: labResults,
        documentRecords: documents,
        uploadRecords: uploads,
      },
    };
  }

  // NOUVELLES MÉTHODES POUR LES DOCUMENTS :

  // Récupérer mes documents avec filtrage par type (pour la section "Mes Documents")
  async findMyDocuments(userId: string, page: number = 1, limit: number = 10, recordType?: string) {
    const skip = (page - 1) * limit;

    const where: any = { 
      userId,
      isVisibleToPatient: true 
    };

    // Filtrer par type si spécifié
    if (recordType) {
      where.recordType = recordType;
    }

    // Filtrer pour ne récupérer que les documents uploadés
    where.OR = [
      { recordType: 'document' },
      { recordType: 'upload' },
      { recordType: 'analysis' },
      { recordType: 'radiology' },
      { recordType: 'invoice' },
      { recordType: 'medical_certificate' },
      { recordType: 'insurance' },
      { recordType: 'vaccination' },
      { recordType: 'other' }
    ];

    const [records, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where,
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
        },
        orderBy: {
          recordDate: 'desc',
        },
      }),
      this.prisma.medicalRecord.count({ where }),
    ]);

    return {
      message: 'Mes documents récupérés',
      documents: records,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

// Télécharger un document sécurisé
  async downloadDocument(documentId: string, userId: string, res: Response) {
    // Vérifier que le document existe et appartient au patient
    const document = await this.prisma.medicalRecord.findFirst({
      where: {
        id: documentId,
        userId: userId, // Sécurité : seul le propriétaire peut télécharger
        isVisibleToPatient: true,
      },
    });

    if (!document) {
      throw new NotFoundException('Document non trouvé ou accès non autorisé');
    }

    if (!document.fileUrl) {
      throw new BadRequestException('Ce document ne contient pas de fichier');
    }

    // Construire le chemin du fichier
    const filePath = join(process.cwd(), document.fileUrl);

    // Vérifier que le fichier existe physiquement
    if (!existsSync(filePath)) {
      throw new NotFoundException('Fichier non trouvé sur le serveur');
    }

    try {
      // 🔧 NOUVELLE SOLUTION : Définir les headers AVANT res.download()
      const fileName = document.fileName ?? 'document';
      const fileType = document.fileType || 'application/octet-stream';
      
      res.setHeader('Content-Type', fileType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      // Utiliser res.sendFile() au lieu de res.download()
      return res.sendFile(filePath);
      
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      throw new BadRequestException('Impossible de télécharger le fichier');
    }
  }

  // Obtenir les statistiques des documents par type
  async getDocumentStats(userId: string) {
    const stats = await this.prisma.medicalRecord.groupBy({
      by: ['recordType'],
      where: {
        userId,
        isVisibleToPatient: true,
        recordType: {
          in: ['document', 'upload', 'analysis', 'radiology', 'invoice', 'medical_certificate', 'insurance', 'vaccination', 'other']
        }
      },
      _count: {
        recordType: true,
      },
    });

    const formattedStats = stats.reduce((acc, stat) => {
      acc[stat.recordType] = stat._count.recordType;
      return acc;
    }, {} as Record<string, number>);

    return {
      message: 'Statistiques des documents',
      stats: formattedStats,
      totalDocuments: Object.values(formattedStats).reduce((sum, count) => sum + count, 0),
    };
  }
}