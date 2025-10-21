import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  // Hasher un mot de passe
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Créer un nouveau médecin
  async create(createDoctorDto: CreateDoctorDto) {
    const { email, password, firstName, lastName, speciality } = createDoctorDto;

    // Vérifier si l'email existe déjà
    const existingDoctor = await this.prisma.doctor.findUnique({
      where: { email },
    });

    if (existingDoctor) {
      throw new ConflictException('Un médecin avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const passwordHash = await this.hashPassword(password);

    // Créer le médecin
    const newDoctor = await this.prisma.doctor.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        speciality: speciality || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        speciality: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Médecin créé avec succès',
      doctor: newDoctor,
    };
  }

  // Récupérer tous les médecins (avec pagination)
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      this.prisma.doctor.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          speciality: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.doctor.count(),
    ]);

    return {
      message: 'Liste des médecins récupérée',
      doctors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalDoctors: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // Récupérer tous les médecins actifs (pour l'attribution des RDV)
  async findAllActive() {
    const doctors = await this.prisma.doctor.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        speciality: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return {
      message: 'Liste des médecins actifs',
      doctors,
    };
  }

  // Récupérer un médecin par ID
  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        speciality: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Médecin avec l'ID ${id} non trouvé`);
    }

    return {
      message: 'Médecin trouvé',
      doctor,
    };
  }

  // Récupérer un médecin par email
  async findByEmail(email: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        speciality: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Médecin avec l'email ${email} non trouvé`);
    }

    return {
      message: 'Médecin trouvé',
      doctor,
    };
  }

  // Mettre à jour un médecin
  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    // Vérifier si le médecin existe
    const existingDoctor = await this.prisma.doctor.findUnique({
      where: { id },
    });

    if (!existingDoctor) {
      throw new NotFoundException(`Médecin avec l'ID ${id} non trouvé`);
    }

    // Si on change l'email, vérifier qu'il n'existe pas déjà
    if (updateDoctorDto.email && updateDoctorDto.email !== existingDoctor.email) {
      const emailExists = await this.prisma.doctor.findUnique({
        where: { email: updateDoctorDto.email },
      });

      if (emailExists) {
        throw new ConflictException('Un médecin avec cet email existe déjà');
      }
    }

    // Préparer les données à mettre à jour
    const updateData: any = { ...updateDoctorDto };

    // Si on change le mot de passe, le hasher
    if (updateDoctorDto.password) {
      updateData.passwordHash = await this.hashPassword(updateDoctorDto.password);
      delete updateData.password;
    }

    // Mettre à jour
    const updatedDoctor = await this.prisma.doctor.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        speciality: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Médecin mis à jour avec succès',
      doctor: updatedDoctor,
    };
  }

  // Désactiver un médecin (soft delete)
  async remove(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException(`Médecin avec l'ID ${id} non trouvé`);
    }

    // Désactiver au lieu de supprimer
    const deactivatedDoctor = await this.prisma.doctor.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    return {
      message: 'Médecin désactivé avec succès',
      doctor: deactivatedDoctor,
    };
  }

  // Réactiver un médecin
  async activate(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException(`Médecin avec l'ID ${id} non trouvé`);
    }

    const activatedDoctor = await this.prisma.doctor.update({
      where: { id },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    return {
      message: 'Médecin réactivé avec succès',
      doctor: activatedDoctor,
    };
  }

  // Statistiques des médecins
  async getStats() {
    const [totalDoctors, activeDoctors, inactiveDoctors, recentDoctors] = await Promise.all([
      this.prisma.doctor.count(),
      this.prisma.doctor.count({ where: { isActive: true } }),
      this.prisma.doctor.count({ where: { isActive: false } }),
      this.prisma.doctor.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 derniers jours
          },
        },
      }),
    ]);

    return {
      message: 'Statistiques des médecins',
      stats: {
        totalDoctors,
        activeDoctors,
        inactiveDoctors,
        recentDoctors,
        activationRate: totalDoctors > 0 ? Math.round((activeDoctors / totalDoctors) * 100) : 0,
      },
    };
  }

  // Récupérer les médecins par spécialité
  // Récupérer les médecins par spécialité
async findBySpeciality(speciality: string) {
  const doctors = await this.prisma.doctor.findMany({
    where: {
      speciality: {
        contains: speciality,
      },
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      speciality: true,
    },
    orderBy: {
      firstName: 'asc',
    },
  });

  return {
    message: `Médecins spécialisés en ${speciality}`,
    doctors,
    count: doctors.length,
  };
}
}