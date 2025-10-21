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
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admins')
@UseGuards(JwtAuthGuard) // Toutes les routes sont protégées
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  // Créer un nouvel administrateur (super admin uniquement)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  // Récupérer tous les administrateurs avec pagination
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.adminsService.findAll(pageNum, limitNum);
  }

  // Récupérer les statistiques des administrateurs
  @Get('stats')
  getStats() {
    return this.adminsService.getStats();
  }

  // Récupérer les administrateurs par rôle
  @Get('role/:role')
  findByRole(@Param('role') role: string) {
    return this.adminsService.findByRole(role);
  }

  // Récupérer un administrateur par ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(id);
  }

  // Récupérer un administrateur par email
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.adminsService.findByEmail(email);
  }

  // Mettre à jour un administrateur
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminsService.update(id, updateAdminDto);
  }

  // Désactiver un administrateur (soft delete)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminsService.remove(id);
  }

  // Réactiver un administrateur
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.adminsService.activate(id);
  }
}