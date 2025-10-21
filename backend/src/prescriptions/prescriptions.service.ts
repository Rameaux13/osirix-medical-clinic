// ============================================================================
// OSIRIX CLINIQUE MÉDICAL - MODULE PRESCRIPTIONS
// Service pour gestion des prescriptions médicales
// Créé le: 24/09/2025
// ============================================================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // CRÉATION D'UNE PRESCRIPTION (Médecin)
  // ============================================================================
  async create(createPrescriptionDto: CreatePrescriptionDto, doctorId: string) {
    try {
      // Vérifier que la consultation existe et récupérer les infos
      const consultation = await this.prisma.consultation.findUnique({
        where: { id: createPrescriptionDto.consultationId },
        include: { user: true, doctor: true }
      });

      if (!consultation) {
        throw new NotFoundException('Consultation introuvable');
      }

      // Vérifier que le médecin connecté est bien le médecin de la consultation
      if (consultation.doctorId !== doctorId) {
        throw new BadRequestException('Vous n\'êtes pas autorisé à prescrire pour cette consultation');
      }

      // Créer la prescription
      const prescription = await this.prisma.prescription.create({
        data: {
          consultationId: createPrescriptionDto.consultationId,
          userId: consultation.userId, // Patient de la consultation
          doctorId: doctorId, // Médecin connecté
          medications: createPrescriptionDto.medications,
          instructions: createPrescriptionDto.instructions,
          pharmacyNotes: createPrescriptionDto.pharmacyNotes,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              speciality: true
            }
          },
          consultation: {
            select: {
              id: true,
              consultationDate: true
            }
          }
        }
      });

      return {
        success: true,
        message: 'Prescription créée avec succès',
        data: prescription
      };

    } catch (error) {
      console.error('Erreur création prescription:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // RÉCUPÉRER TOUTES LES PRESCRIPTIONS D'UN PATIENT
  // ============================================================================
  async findByPatient(userId: string) {
    try {
      const prescriptions = await this.prisma.prescription.findMany({
        where: { 
          userId: userId,
          isActive: true 
        },
        include: {
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              speciality: true
            }
          },
          consultation: {
            select: {
              id: true,
              consultationDate: true,
              diagnosis: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        message: 'Prescriptions récupérées avec succès',
        data: prescriptions,
        count: prescriptions.length
      };

    } catch (error) {
      console.error('Erreur récupération prescriptions patient:', error.message);
      throw new BadRequestException('Erreur lors de la récupération des prescriptions');
    }
  }

  // ============================================================================
  // RÉCUPÉRER TOUTES LES PRESCRIPTIONS D'UN MÉDECIN
  // ============================================================================
  async findByDoctor(doctorId: string) {
    try {
      const prescriptions = await this.prisma.prescription.findMany({
        where: { 
          doctorId: doctorId,
          isActive: true 
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          consultation: {
            select: {
              id: true,
              consultationDate: true,
              diagnosis: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        message: 'Prescriptions du médecin récupérées avec succès',
        data: prescriptions,
        count: prescriptions.length
      };

    } catch (error) {
      console.error('Erreur récupération prescriptions médecin:', error.message);
      throw new BadRequestException('Erreur lors de la récupération des prescriptions');
    }
  }

  // ============================================================================
  // RÉCUPÉRER UNE PRESCRIPTION PAR ID
  // ============================================================================
  async findOne(id: string, userId?: string, doctorId?: string) {
    try {
      const prescription = await this.prisma.prescription.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              speciality: true
            }
          },
          consultation: {
            select: {
              id: true,
              consultationDate: true,
              diagnosis: true,
              vitalSigns: true
            }
          }
        }
      });

      if (!prescription) {
        throw new NotFoundException('Prescription introuvable');
      }

      // Vérification des autorisations
      if (userId && prescription.userId !== userId) {
        throw new BadRequestException('Vous n\'êtes pas autorisé à voir cette prescription');
      }

      if (doctorId && prescription.doctorId !== doctorId) {
        throw new BadRequestException('Vous n\'êtes pas autorisé à voir cette prescription');
      }

      return {
        success: true,
        message: 'Prescription récupérée avec succès',
        data: prescription
      };

    } catch (error) {
      console.error('Erreur récupération prescription:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // METTRE À JOUR UNE PRESCRIPTION (Médecin uniquement)
  // ============================================================================
  async update(id: string, updatePrescriptionDto: UpdatePrescriptionDto, doctorId: string) {
    try {
      // Vérifier que la prescription existe et appartient au médecin
      const existingPrescription = await this.prisma.prescription.findUnique({
        where: { id }
      });

      if (!existingPrescription) {
        throw new NotFoundException('Prescription introuvable');
      }

      if (existingPrescription.doctorId !== doctorId) {
        throw new BadRequestException('Vous n\'êtes pas autorisé à modifier cette prescription');
      }

      // Mettre à jour la prescription
      const updatedPrescription = await this.prisma.prescription.update({
        where: { id },
        data: {
          ...updatePrescriptionDto,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              speciality: true
            }
          },
          consultation: {
            select: {
              id: true,
              consultationDate: true
            }
          }
        }
      });

      return {
        success: true,
        message: 'Prescription mise à jour avec succès',
        data: updatedPrescription
      };

    } catch (error) {
      console.error('Erreur mise à jour prescription:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // DÉSACTIVER UNE PRESCRIPTION (Médecin uniquement)
  // ============================================================================
  async remove(id: string, doctorId: string) {
    try {
      // Vérifier que la prescription existe et appartient au médecin
      const existingPrescription = await this.prisma.prescription.findUnique({
        where: { id }
      });

      if (!existingPrescription) {
        throw new NotFoundException('Prescription introuvable');
      }

      if (existingPrescription.doctorId !== doctorId) {
        throw new BadRequestException('Vous n\'êtes pas autorisé à supprimer cette prescription');
      }

      // Désactiver la prescription au lieu de la supprimer
      await this.prisma.prescription.update({
        where: { id },
        data: { isActive: false }
      });

      return {
        success: true,
        message: 'Prescription désactivée avec succès'
      };

    } catch (error) {
      console.error('Erreur suppression prescription:', error.message);
      throw error;
    }
  }
}