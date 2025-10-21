import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  // Hasher un mot de passe
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Créer un nouvel administrateur
  async create(createAdminDto: CreateAdminDto) {
    const { email, password, firstName, lastName, role } = createAdminDto;

    // Vérifier si l'email existe déjà
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      throw new ConflictException('Un administrateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const passwordHash = await this.hashPassword(password);

    // Créer l'administrateur
    const newAdmin = await this.prisma.admin.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: role || 'admin',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Administrateur créé avec succès',
      admin: newAdmin,
    };
  }

  // Récupérer tous les administrateurs (avec pagination)
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [admins, total] = await Promise.all([
      this.prisma.admin.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.admin.count(),
    ]);

    return {
      message: 'Liste des administrateurs récupérée',
      admins,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalAdmins: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // Récupérer un administrateur par ID
  async findOne(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      throw new NotFoundException(`Administrateur avec l'ID ${id} non trouvé`);
    }

    return {
      message: 'Administrateur trouvé',
      admin,
    };
  }

  // Récupérer un administrateur par email
  async findByEmail(email: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      throw new NotFoundException(`Administrateur avec l'email ${email} non trouvé`);
    }

    return {
      message: 'Administrateur trouvé',
      admin,
    };
  }

  // Mettre à jour un administrateur
  async update(id: string, updateAdminDto: UpdateAdminDto) {
    // Vérifier si l'administrateur existe
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!existingAdmin) {
      throw new NotFoundException(`Administrateur avec l'ID ${id} non trouvé`);
    }

    // Si on change l'email, vérifier qu'il n'existe pas déjà
    if (updateAdminDto.email && updateAdminDto.email !== existingAdmin.email) {
      const emailExists = await this.prisma.admin.findUnique({
        where: { email: updateAdminDto.email },
      });

      if (emailExists) {
        throw new ConflictException('Un administrateur avec cet email existe déjà');
      }
    }

    // Préparer les données à mettre à jour
    const updateData: any = { ...updateAdminDto };

    // Si on change le mot de passe, le hasher
    if (updateAdminDto.password) {
      updateData.passwordHash = await this.hashPassword(updateAdminDto.password);
      delete updateData.password;
    }

    // Mettre à jour
    const updatedAdmin = await this.prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Administrateur mis à jour avec succès',
      admin: updatedAdmin,
    };
  }

  // Désactiver un administrateur (soft delete)
  async remove(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new NotFoundException(`Administrateur avec l'ID ${id} non trouvé`);
    }

    // Désactiver au lieu de supprimer
    const deactivatedAdmin = await this.prisma.admin.update({
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
      message: 'Administrateur désactivé avec succès',
      admin: deactivatedAdmin,
    };
  }

  // Réactiver un administrateur
  async activate(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new NotFoundException(`Administrateur avec l'ID ${id} non trouvé`);
    }

    const activatedAdmin = await this.prisma.admin.update({
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
      message: 'Administrateur réactivé avec succès',
      admin: activatedAdmin,
    };
  }

  // Statistiques des administrateurs
  async getStats() {
    const [totalAdmins, activeAdmins, inactiveAdmins, recentAdmins] = await Promise.all([
      this.prisma.admin.count(),
      this.prisma.admin.count({ where: { isActive: true } }),
      this.prisma.admin.count({ where: { isActive: false } }),
      this.prisma.admin.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 derniers jours
          },
        },
      }),
    ]);

    return {
      message: 'Statistiques des administrateurs',
      stats: {
        totalAdmins,
        activeAdmins,
        inactiveAdmins,
        recentAdmins,
        activationRate: totalAdmins > 0 ? Math.round((activeAdmins / totalAdmins) * 100) : 0,
      },
    };
  }

  // Récupérer les administrateurs par rôle
  async findByRole(role: string) {
    const admins = await this.prisma.admin.findMany({
      where: {
        role: role,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return {
      message: `Administrateurs avec le rôle ${role}`,
      admins,
      count: admins.length,
    };
  }
}