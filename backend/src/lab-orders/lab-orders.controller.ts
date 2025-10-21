import {
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SecretaryGuard } from '../auth-staff/guards/secretary.guard';
import { LabOrdersService } from './lab-orders.service';
import { SendLabOrderDto } from './dto/send-lab-order.dto';
import { LabOrder } from '@prisma/client';

@Controller('lab-orders')
export class LabOrdersController {
  constructor(private readonly labOrdersService: LabOrdersService) {}

  // =====================================================
  // ROUTES PATIENTS
  // =====================================================

  @Get('my-analyses')
  @UseGuards(JwtAuthGuard)
  async getMyAnalyses(@Request() req): Promise<LabOrder[]> {
    try {
      const userId = req.user.userId;
      return await this.labOrdersService.getMyAnalyses(userId);
    } catch (error) {
      console.error('Erreur dans getMyAnalyses:', error.message);
      throw new HttpException(
        'Impossible de récupérer vos analyses',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('my-analyses/stats')
  @UseGuards(JwtAuthGuard)
  async getMyAnalysesStats(@Request() req) {
    try {
      const userId = req.user.userId;
      return await this.labOrdersService.getAnalysesStats(userId);
    } catch (error) {
      console.error('Erreur dans getMyAnalysesStats:', error.message);
      throw new HttpException(
        'Impossible de récupérer les statistiques',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('my-analyses/recent')
  @UseGuards(JwtAuthGuard)
  async getRecentAnalyses(@Request() req): Promise<LabOrder[]> {
    try {
      const userId = req.user.userId;
      return await this.labOrdersService.getRecentAnalyses(userId, 3);
    } catch (error) {
      console.error('Erreur dans getRecentAnalyses:', error.message);
      throw new HttpException(
        'Impossible de récupérer les analyses récentes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================================
  // ROUTES SECRÉTAIRE
  // =====================================================

  @Post('upload-result')
  @UseGuards(SecretaryGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/lab-results',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `lab-result-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Type de fichier non autorisé'), false);
        }
      },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async uploadResultFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException(
        'Aucun fichier fourni',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: 'Fichier uploadé avec succès',
      file: {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: `/uploads/lab-results/${file.filename}`,
      },
    };
  }

  @Post('secretary/send')
  @UseGuards(SecretaryGuard)
  @HttpCode(HttpStatus.CREATED)
  async sendLabOrderToPatient(
    @Body() sendLabOrderDto: SendLabOrderDto,
    @Request() req,
  ) {
    try {
      const secretaryId = req.user.sub;
      return await this.labOrdersService.sendLabOrderToPatient(
        sendLabOrderDto,
        secretaryId,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Erreur dans sendLabOrderToPatient:', error.message);
      throw new HttpException(
        'Impossible d\'envoyer l\'analyse au patient',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================================
  // ROUTES MÉDECINS
  // =====================================================

  @Get('my-created-analyses')
  @UseGuards(JwtAuthGuard)
  async getMyCreatedAnalyses(@Request() req): Promise<LabOrder[]> {
    try {
      const userRole = req.user.role;
      
      if (userRole !== 'DOCTOR') {
        throw new HttpException(
          'Accès réservé aux médecins',
          HttpStatus.FORBIDDEN,
        );
      }

      const doctorId = req.user.userId;
      return await this.labOrdersService.getMyCreatedAnalyses(doctorId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Erreur dans getMyCreatedAnalyses:', error.message);
      throw new HttpException(
        'Impossible de récupérer les analyses créées',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateAnalysis(
    @Param('id') id: string,
    @Body() updateData: { 
      status?: string; 
      results?: string; 
      resultsDate?: string;
      resultFiles?: any[];
    },
    @Request() req,
  ): Promise<LabOrder> {
    try {
      const userRole = req.user.role;
      
      if (userRole !== 'DOCTOR') {
        throw new HttpException(
          'Seuls les médecins peuvent modifier les analyses',
          HttpStatus.FORBIDDEN,
        );
      }

      const doctorId = req.user.userId;
      
      const updateDataParsed = {
        ...updateData,
        resultsDate: updateData.resultsDate ? new Date(updateData.resultsDate) : undefined,
        resultFiles: updateData.resultFiles || undefined,
      };

      return await this.labOrdersService.updateAnalysisStatus(
        id,
        doctorId,
        updateDataParsed,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Erreur dans updateAnalysis:', error.message);
      throw new HttpException(
        'Impossible de mettre à jour l\'analyse',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================================
  // ROUTES MIXTES (Patients + Médecins)
  // =====================================================

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getAnalysisById(@Param('id') id: string, @Request() req): Promise<LabOrder> {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;

      if (userRole === 'PATIENT') {
        return await this.labOrdersService.getAnalysisById(id, userId);
      }

      if (userRole === 'DOCTOR') {
        const analysis = await this.labOrdersService.getAnalysisById(id, userId);
        return analysis;
      }

      throw new HttpException(
        'Rôle non autorisé',
        HttpStatus.FORBIDDEN,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Erreur dans getAnalysisById:', error.message);
      throw new HttpException(
        'Impossible de récupérer l\'analyse',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/download-results')
  @UseGuards(JwtAuthGuard)
  async downloadAnalysisResults(@Param('id') id: string, @Request() req) {
    try {
      const userId = req.user.userId;
      
      const analysis = await this.labOrdersService.getAnalysisById(id, userId);
      
      const resultFilesArray = analysis.resultFiles as any[] || [];
      if (!analysis.results && resultFilesArray.length === 0) {
        throw new HttpException(
          'Aucun résultat disponible pour cette analyse',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        analysisId: analysis.id,
        examType: analysis.examType,
        results: analysis.results,
        resultFiles: resultFilesArray,
        resultsDate: analysis.resultsDate,
        hasFiles: resultFilesArray.length > 0,
        hasTextResults: !!analysis.results,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Erreur dans downloadAnalysisResults:', error.message);
      throw new HttpException(
        'Impossible de télécharger les résultats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}