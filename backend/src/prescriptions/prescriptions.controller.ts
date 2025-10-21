// ============================================================================
// OSIRIX CLINIQUE MÉDICAL - MODULE PRESCRIPTIONS
// Controller pour gestion des prescriptions médicales
// Créé le: 24/09/2025
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  // ============================================================================
  // CRÉER UNE PRESCRIPTION (Médecin uniquement)
  // POST /prescriptions
  // ============================================================================
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPrescriptionDto: CreatePrescriptionDto, @Request() req) {
    try {
      // Vérifier que l'utilisateur est un médecin
      if (req.user.userType !== 'doctor') {
        return {
          success: false,
          message: 'Seuls les médecins peuvent créer des prescriptions',
          statusCode: HttpStatus.FORBIDDEN
        };
      }

      const result = await this.prescriptionsService.create(
        createPrescriptionDto, 
        req.user.userId
      );
      
      return {
        ...result,
        statusCode: HttpStatus.CREATED
      };

    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erreur lors de la création de la prescription',
        statusCode: HttpStatus.BAD_REQUEST
      };
    }
  }

  // ============================================================================
  // RÉCUPÉRER SES PRESCRIPTIONS (Patient)
  // GET /prescriptions/my-prescriptions
  // ============================================================================
  @Get('my-prescriptions')
  @HttpCode(HttpStatus.OK)
  async getMyPrescriptions(@Request() req) {
    try {
      // Seuls les patients peuvent voir leurs prescriptions
      if (req.user.userType !== 'patient') {
        return {
          success: false,
          message: 'Seuls les patients peuvent voir leurs prescriptions',
          statusCode: HttpStatus.FORBIDDEN
        };
      }

      const result = await this.prescriptionsService.findByPatient(req.user.userId);
      
      return {
        ...result,
        statusCode: HttpStatus.OK
      };

    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erreur lors de la récupération des prescriptions',
        statusCode: HttpStatus.BAD_REQUEST
      };
    }
  }

  // ============================================================================
  // RÉCUPÉRER LES PRESCRIPTIONS CRÉÉES (Médecin)
  // GET /prescriptions/my-created-prescriptions
  // ============================================================================
  @Get('my-created-prescriptions')
  @HttpCode(HttpStatus.OK)
  async getMyCreatedPrescriptions(@Request() req) {
    try {
      // Seuls les médecins peuvent voir leurs prescriptions créées
      if (req.user.userType !== 'doctor') {
        return {
          success: false,
          message: 'Seuls les médecins peuvent voir leurs prescriptions créées',
          statusCode: HttpStatus.FORBIDDEN
        };
      }

      const result = await this.prescriptionsService.findByDoctor(req.user.userId);
      
      return {
        ...result,
        statusCode: HttpStatus.OK
      };

    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erreur lors de la récupération des prescriptions',
        statusCode: HttpStatus.BAD_REQUEST
      };
    }
  }

  // ============================================================================
  // RÉCUPÉRER UNE PRESCRIPTION PAR ID
  // GET /prescriptions/:id
  // ============================================================================
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string, @Request() req) {
    try {
      const userId = req.user.userType === 'patient' ? req.user.userId : undefined;
      const doctorId = req.user.userType === 'doctor' ? req.user.userId : undefined;

      const result = await this.prescriptionsService.findOne(id, userId, doctorId);
      
      return {
        ...result,
        statusCode: HttpStatus.OK
      };

    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erreur lors de la récupération de la prescription',
        statusCode: error.status || HttpStatus.BAD_REQUEST
      };
    }
  }

  // ============================================================================
  // METTRE À JOUR UNE PRESCRIPTION (Médecin uniquement)
  // PATCH /prescriptions/:id
  // ============================================================================
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string, 
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
    @Request() req
  ) {
    try {
      // Vérifier que l'utilisateur est un médecin
      if (req.user.userType !== 'doctor') {
        return {
          success: false,
          message: 'Seuls les médecins peuvent modifier des prescriptions',
          statusCode: HttpStatus.FORBIDDEN
        };
      }

      const result = await this.prescriptionsService.update(
        id, 
        updatePrescriptionDto, 
        req.user.userId
      );
      
      return {
        ...result,
        statusCode: HttpStatus.OK
      };

    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erreur lors de la mise à jour de la prescription',
        statusCode: error.status || HttpStatus.BAD_REQUEST
      };
    }
  }

  // ============================================================================
  // DÉSACTIVER UNE PRESCRIPTION (Médecin uniquement)
  // DELETE /prescriptions/:id
  // ============================================================================
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Request() req) {
    try {
      // Vérifier que l'utilisateur est un médecin
      if (req.user.userType !== 'doctor') {
        return {
          success: false,
          message: 'Seuls les médecins peuvent supprimer des prescriptions',
          statusCode: HttpStatus.FORBIDDEN
        };
      }

      const result = await this.prescriptionsService.remove(id, req.user.userId);
      
      return {
        ...result,
        statusCode: HttpStatus.OK
      };

    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erreur lors de la suppression de la prescription',
        statusCode: error.status || HttpStatus.BAD_REQUEST
      };
    }
  }

  // ============================================================================
  // STATISTIQUES PRESCRIPTIONS (Admin/Médecin)
  // GET /prescriptions/stats/overview
  // ============================================================================
  @Get('stats/overview')
  @HttpCode(HttpStatus.OK)
  async getStats(@Request() req) {
    try {
      // Seuls admin et médecins peuvent voir les stats
      if (!['admin', 'doctor'].includes(req.user.userType)) {
        return {
          success: false,
          message: 'Accès non autorisé aux statistiques',
          statusCode: HttpStatus.FORBIDDEN
        };
      }

      // Pour un médecin, stats de ses propres prescriptions
      if (req.user.userType === 'doctor') {
        const result = await this.prescriptionsService.findByDoctor(req.user.userId);
        return {
          success: true,
          message: 'Statistiques récupérées avec succès',
          data: {
            totalPrescriptions: result.count,
            prescriptions: result.data
          },
          statusCode: HttpStatus.OK
        };
      }

      // TODO: Implémenter stats globales pour admin
      return {
        success: true,
        message: 'Statistiques admin à implémenter',
        data: { message: 'Fonctionnalité en développement' },
        statusCode: HttpStatus.OK
      };

    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erreur lors de la récupération des statistiques',
        statusCode: HttpStatus.BAD_REQUEST
      };
    }
  }
}