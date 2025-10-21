import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, createReadStream } from 'fs'; // ✅ AJOUTÉ createReadStream
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Configuration pour l'upload de fichiers
const multerConfig = {
  storage: diskStorage({
    destination: './uploads/medical-records',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = extname(file.originalname);
      callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new BadRequestException('Type de fichier non autorisé'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
};

@Controller('medical-records')
@UseGuards(JwtAuthGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  // Upload d'un document avec fichier
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadDocument(
    @UploadedFile() file: any, // Changé de Express.Multer.File à any
    @Body() body: any,
    @Request() req
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const createDto: CreateMedicalRecordDto = {
      userId: req.user.id,
      recordType: body.recordType || 'document',
      title: body.title || file.originalname,
      content: body.description || null,
      fileUrl: `/uploads/medical-records/${file.filename}`,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      isVisibleToPatient: true,
      tags: body.tags || null,
      description: body.description || null,
    };

    return this.medicalRecordsService.create(createDto);
  }

  // 🔒 ROUTE SÉCURISÉE POUR PRÉVISUALISATION - VERSION AVEC PDF
@Get(':id/preview')
async previewDocument(
  @Param('id') id: string,
  @Request() req,
  @Res() res: Response
) {
  // Vérifier que le document existe et appartient au patient
  const document = await this.medicalRecordsService.findOne(id);
  
  // Vérifier les permissions
  if (document.record.userId !== req.user.id) {
    throw new ForbiddenException('Accès non autorisé à ce document');
  }

  if (!document.record.fileUrl) {
    throw new BadRequestException('Ce document ne contient pas de fichier');
  }

  // Construire le chemin du fichier
  const filePath = join(process.cwd(), document.record.fileUrl);

  // Vérifier que le fichier existe physiquement
  if (!existsSync(filePath)) {
    throw new NotFoundException('Fichier non trouvé sur le serveur');
  }

  try {
    const fileType = document.record.fileType || 'application/octet-stream';
    
    // 🔧 IMAGES ET PDF : Servir directement le fichier
    if (fileType.includes('image') || fileType.includes('pdf')) {
      // Définir les headers AVANT de streamer
      res.setHeader('Content-Type', fileType);
      res.setHeader('Content-Disposition', `inline; filename="${document.record.fileName}"`);
      res.setHeader('Cache-Control', 'private, max-age=3600');
      
      // ✅ STREAMER le fichier directement
      const fileStream = createReadStream(filePath);
      
      // Gérer les erreurs de stream
      fileStream.on('error', (error) => {
        console.error('Erreur lecture fichier:', error);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Erreur lors de la lecture du fichier' });
        }
      });
      
      // Piper le stream directement vers la response
      return fileStream.pipe(res);
    }
    
    // 🔧 POUR LES AUTRES FICHIERS (Word, Excel, etc.)
    else {
      return res.json({
        type: 'other',
        message: 'Prévisualisation non disponible pour ce type de fichier',
        fileName: document.record.fileName,
        fileType: fileType
      });
    }
    
  } catch (error) {
    console.error('Erreur prévisualisation:', error);
    throw new BadRequestException('Impossible d\'afficher le fichier');
  }
}

  // Télécharger un document
  @Get(':id/download')
  async downloadDocument(
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response
  ) {
    return this.medicalRecordsService.downloadDocument(id, req.user.id, res);
  }

  // Créer un nouveau dossier médical (médecins/admins)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMedicalRecordDto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(createMedicalRecordDto);
  }

  // Récupérer tous les dossiers médicaux avec filtres (admins/médecins)
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('recordType') recordType?: string,
    @Query('userId') userId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.medicalRecordsService.findAll(pageNum, limitNum, recordType, userId);
  }

  // Récupérer mes documents (patients)
  @Get('my-documents')
  findMyDocuments(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('recordType') recordType?: string,
  ) {
    const userId = req.user.id;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.medicalRecordsService.findMyDocuments(userId, pageNum, limitNum, recordType);
  }

  // Récupérer mon carnet médical (patients)
  @Get('my-records')
  findMyRecords(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.id;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.medicalRecordsService.findByPatient(userId, pageNum, limitNum);
  }

  // Rechercher dans les dossiers
  @Get('search')
  search(
    @Query('q') query: string,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.medicalRecordsService.search(query, userId, pageNum, limitNum);
  }

  // Statistiques des dossiers médicaux
  @Get('stats')
  getStats() {
    return this.medicalRecordsService.getStats();
  }

  // Statistiques des documents du patient connecté
  @Get('my-documents/stats')
  getMyDocumentStats(@Request() req) {
    return this.medicalRecordsService.getDocumentStats(req.user.id);
  }

  // Récupérer les dossiers par type
  @Get('type/:recordType')
  findByType(
    @Param('recordType') recordType: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.medicalRecordsService.findByType(recordType, pageNum, limitNum);
  }

  // Récupérer les dossiers d'un patient spécifique (médecins/admins)
  @Get('patient/:userId')
  findByPatient(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.medicalRecordsService.findByPatient(userId, pageNum, limitNum);
  }

  // Récupérer un dossier par ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(id);
  }

  // Mettre à jour un dossier médical
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedicalRecordDto: UpdateMedicalRecordDto) {
    return this.medicalRecordsService.update(id, updateMedicalRecordDto);
  }

  // Supprimer un dossier médical
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.medicalRecordsService.remove(id, req.user.id);
  }
}