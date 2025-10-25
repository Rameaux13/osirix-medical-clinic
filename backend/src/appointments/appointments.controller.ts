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
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ConfirmAppointmentDto } from './dto/confirm-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SecretaryGuard } from '../auth-staff/guards/secretary.guard';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  // ========================================
  // 🆕 ROUTES SECRÉTAIRE (EN PREMIER pour éviter conflits de routing)
  // ========================================

  /**
   * Récupérer tous les RDV en attente (secrétaire)
   */
  @Get('secretary/pending')
  @UseGuards(SecretaryGuard)
  getPendingAppointments() {
    return this.appointmentsService.getPendingAppointments();
  }

  /**
   * Récupérer les statistiques dashboard (secrétaire)
   */
  @Get('secretary/stats')
  @UseGuards(SecretaryGuard)
  getSecretaryStats() {
    return this.appointmentsService.getSecretaryStats();
  }

  /**
   * Récupérer tous les RDV avec filtres (secrétaire)
   */
  @Get('secretary/all')
  @UseGuards(SecretaryGuard)
  getAllAppointmentsForSecretary(
    @Query('status') status?: string,
    @Query('date') date?: string,
    @Query('patient') patientSearch?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.appointmentsService.getAllAppointmentsForSecretary(
      status,
      date,
      patientSearch,
      pageNum,
      limitNum,
    );
  }

  /**
   * Confirmer un RDV (secrétaire)
   */
  @Patch(':id/confirm')
  @UseGuards(SecretaryGuard)
  confirmAppointment(
    @Param('id') id: string,
    @Body() dto: ConfirmAppointmentDto,
  ) {
    return this.appointmentsService.confirmAppointment(id, dto.notes);
  }

  /**
   * Annuler un RDV (secrétaire)
   */
  @Patch(':id/cancel-by-secretary')
  @UseGuards(SecretaryGuard)
  cancelBySecretary(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.appointmentsService.cancelBySecretary(id, reason);
  }

  @Patch(':id/complete')
  @UseGuards(SecretaryGuard)
  completeAppointment(
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ) {
    return this.appointmentsService.completeAppointment(id, notes);
  }

  // ========================================
  // ROUTES PATIENTS ET GÉNÉRALES
  // ========================================

  // Créer un nouveau rendez-vous (patient)
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req, @Body() createAppointmentDto: CreateAppointmentDto) {
    const userId = req.user.id;
    return this.appointmentsService.create(userId, createAppointmentDto);
  }

  // Récupérer tous les rendez-vous avec filtres (admin/médecins)
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('urgencyLevel') urgencyLevel?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.appointmentsService.findAll(pageNum, limitNum, status, urgencyLevel);
  }

  // Récupérer les RDV de l'utilisateur connecté (patients)
  @Get('my-appointments')
  @UseGuards(JwtAuthGuard)
  findMyAppointments(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.id;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.appointmentsService.findByUser(userId, pageNum, limitNum);
  }

  // Vérifier la disponibilité des créneaux pour une date
  @Get('availability/:date')
  async getDateAvailability(
    @Param('date') date: string,
    @Query('service') service?: string  
  ) {
    return this.appointmentsService.getDateAvailability(date, service);
  }

  // Récupérer les statistiques des RDV (admin)
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats() {
    return this.appointmentsService.getStats();
  }

  // Générer des créneaux automatiquement (admin)
  @Post('generate-slots')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  generateTimeSlots(
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
  ) {
    return this.appointmentsService.generateTimeSlots(
      new Date(startDate),
      new Date(endDate),
    );
  }

  // Récupérer les RDV d'un patient spécifique (admin/médecins)
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  findByUser(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.appointmentsService.findByUser(userId, pageNum, limitNum);
  }

  // Récupérer un RDV par ID
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  // Mettre à jour un RDV
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  // Annuler un RDV
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.appointmentsService.cancel(id, reason);
  }

  // Supprimer définitivement un RDV
  @Delete(':id/permanent')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  permanentDelete(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.appointmentsService.permanentDelete(id, userId);
  }
}