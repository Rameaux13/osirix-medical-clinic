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
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Créer une notification (admins/médecins)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  // Envoyer une notification à tous les patients (admins)
  @Post('broadcast/patients')
  @HttpCode(HttpStatus.CREATED)
  broadcastToPatients(
    @Body('title') title: string,
    @Body('message') message: string,
    @Body('type') type?: string,
  ) {
    return this.notificationsService.createForAllPatients(title, message, type);
  }

  // Envoyer une notification à tous les médecins (admins)
  @Post('broadcast/doctors')
  @HttpCode(HttpStatus.CREATED)
  broadcastToDoctors(
    @Body('title') title: string,
    @Body('message') message: string,
    @Body('type') type?: string,
  ) {
    return this.notificationsService.createForAllDoctors(title, message, type);
  }

  // Récupérer toutes les notifications (admins)
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('isRead') isRead?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const isReadBool = isRead ? isRead === 'true' : undefined;
    return this.notificationsService.findAll(pageNum, limitNum, type, isReadBool);
  }

  // Récupérer mes notifications (utilisateur connecté)
  @Get('my-notifications')
  findMyNotifications(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    
    if (req.user.userType === 'patient') {
      return this.notificationsService.findByUser(req.user.id, pageNum, limitNum);
    } else if (req.user.userType === 'doctor') {
      return this.notificationsService.findByDoctor(req.user.id, pageNum, limitNum);
    }
    
    return this.notificationsService.findAll(pageNum, limitNum);
  }

  // Compter mes notifications non lues
  @Get('my-notifications/unread-count')
  getMyUnreadCount(@Request() req) {
    if (req.user.userType === 'patient') {
      return this.notificationsService.getUnreadCount(req.user.id);
    }
    return { message: 'Compteur non disponible pour ce type d\'utilisateur', unreadCount: 0 };
  }

  // Marquer toutes mes notifications comme lues
  @Patch('my-notifications/mark-all-read')
  markAllMyNotificationsAsRead(@Request() req) {
    if (req.user.userType === 'patient') {
      return this.notificationsService.markAllAsReadForUser(req.user.id);
    }
    return { message: 'Action non disponible pour ce type d\'utilisateur' };
  }

  // Statistiques des notifications (admins)
  @Get('stats')
  getStats() {
    return this.notificationsService.getStats();
  }

  // Récupérer les notifications d'un patient (médecins/admins)
  @Get('user/:userId')
  findByUser(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.notificationsService.findByUser(userId, pageNum, limitNum);
  }

  // Récupérer les notifications d'un médecin (admins)
  @Get('doctor/:doctorId')
  findByDoctor(
    @Param('doctorId') doctorId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.notificationsService.findByDoctor(doctorId, pageNum, limitNum);
  }

  // Récupérer une notification par ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  // Marquer une notification comme lue
  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  // Mettre à jour une notification
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  // Supprimer une notification
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}