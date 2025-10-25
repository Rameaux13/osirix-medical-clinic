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
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SecretaryGuard } from '../auth-staff/guards/secretary.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Créer un nouveau patient (accessible uniquement aux admins)
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Récupérer tous les patients avec pagination
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.usersService.findAll(pageNum, limitNum);
  }

  // Récupérer les statistiques des patients
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats() {
    return this.usersService.getStats();
  }

  // =====================================================
  // 🆕 ROUTE SECRÉTAIRE
  // =====================================================

  /**
   * Récupérer la liste des patients pour la secrétaire
   * Avec recherche par nom, email ou téléphone
   * Route : GET /users/secretary/patients?search=
   */
  @Get('secretary/patients')
  @UseGuards(SecretaryGuard)
  @HttpCode(HttpStatus.OK)
  getPatientsForSecretary(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.usersService.getPatientsForSecretary(search, pageNum, limitNum);
  }

  // =====================================================
  // ROUTES PROFIL PATIENT
  // =====================================================

  /**
   * Récupérer le profil du patient connecté
   * Route : GET /users/profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getProfile(@Req() req: any) {
    const userId = req.user.id; // ✅ CORRIGÉ: id au lieu de userId
    return this.usersService.getProfile(userId);
  }

  /**
   * Mettre à jour le profil du patient connecté
   * Route : PATCH /users/profile
   * Champs modifiables : firstName, lastName, phone, dateOfBirth
   */
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.id; // ✅ CORRIGÉ: id au lieu de userId
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  /**
   * Changer le mot de passe du patient connecté
   * Route : PATCH /users/change-password
   * Nécessite l'ancien mot de passe pour sécurité
   */
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user.id; // ✅ CORRIGÉ: id au lieu de userId
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  // =====================================================
  // ROUTES EXISTANTES (ADMIN)
  // =====================================================

  // Récupérer un patient par ID
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // Récupérer un patient par email
  @Get('email/:email')
  @UseGuards(JwtAuthGuard)
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  // Mettre à jour un patient (admin)
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // Désactiver un patient (soft delete)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // Réactiver un patient
  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard)
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }
}