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
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('doctors')
@UseGuards(JwtAuthGuard) // Toutes les routes sont protégées
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  // Créer un nouveau médecin (accessible uniquement aux admins)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(createDoctorDto);
  }

  // Récupérer tous les médecins avec pagination
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.doctorsService.findAll(pageNum, limitNum);
  }

  // Récupérer tous les médecins actifs (pour l'attribution des RDV)
  @Get('active')
  findAllActive() {
    return this.doctorsService.findAllActive();
  }

  // Récupérer les statistiques des médecins
  @Get('stats')
  getStats() {
    return this.doctorsService.getStats();
  }

  // Récupérer les médecins par spécialité
  @Get('speciality/:speciality')
  findBySpeciality(@Param('speciality') speciality: string) {
    return this.doctorsService.findBySpeciality(speciality);
  }

  // Récupérer un médecin par ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  // Récupérer un médecin par email
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.doctorsService.findByEmail(email);
  }

  // Mettre à jour un médecin
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorsService.update(id, updateDoctorDto);
  }

  // Désactiver un médecin (soft delete)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(id);
  }

  // Réactiver un médecin
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.doctorsService.activate(id);
  }
}