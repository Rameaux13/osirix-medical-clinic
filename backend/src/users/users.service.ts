import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Hasher un mot de passe
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Vérifier un mot de passe
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // =====================================================
  // 🆕 NOUVELLES MÉTHODES POUR PROFIL PATIENT
  // =====================================================

  /**
   * Récupérer le profil du patient connecté
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Profil utilisateur non trouvé');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Compte utilisateur désactivé');
    }

    return {
      message: 'Profil récupéré avec succès',
      user,
    };
  }

  /**
   * Mettre à jour le profil du patient connecté
   * Champs modifiables : firstName, lastName, phone, dateOfBirth
   * L'email n'est PAS modifiable pour sécurité
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Vérifier si l'utilisateur existe et est actif
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (!existingUser.isActive) {
      throw new UnauthorizedException('Compte utilisateur désactivé');
    }

    // Préparer les données à mettre à jour
    const updateData: any = {};

    // Mise à jour des champs fournis
    if (updateProfileDto.firstName !== undefined) {
      updateData.firstName = updateProfileDto.firstName;
    }

    if (updateProfileDto.lastName !== undefined) {
      updateData.lastName = updateProfileDto.lastName;
    }

    if (updateProfileDto.phone !== undefined) {
      updateData.phone = updateProfileDto.phone || null;
    }

    if (updateProfileDto.dateOfBirth !== undefined) {
      updateData.dateOfBirth = updateProfileDto.dateOfBirth 
        ? new Date(updateProfileDto.dateOfBirth) 
        : null;
    }

    // Vérifier qu'au moins un champ est modifié
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Aucune donnée à mettre à jour');
    }

    // Mettre à jour le profil
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Profil mis à jour avec succès',
      user: updatedUser,
    };
  }

  /**
   * Changer le mot de passe du patient connecté
   * Nécessite l'ancien mot de passe pour sécurité
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;

    // Vérifier que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Les nouveaux mots de passe ne correspondent pas');
    }

    // Récupérer l'utilisateur avec le hash du mot de passe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Compte utilisateur désactivé');
    }

    // Vérifier l'ancien mot de passe
    const isOldPasswordValid = await this.verifyPassword(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Ancien mot de passe incorrect');
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    const isSamePassword = await this.verifyPassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new BadRequestException('Le nouveau mot de passe doit être différent de l\'ancien');
    }

    // Hasher le nouveau mot de passe
    const newPasswordHash = await this.hashPassword(newPassword);

    // Mettre à jour le mot de passe
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Mot de passe modifié avec succès',
    };
  }

  // =====================================================
  // MÉTHODES EXISTANTES (INCHANGÉES)
  // =====================================================

  // Créer un nouveau patient
  async create(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName, phone, dateOfBirth } = createUserDto;

    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const passwordHash = await this.hashPassword(password);

    // Créer l'utilisateur
    const newUser = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Utilisateur créé avec succès',
      user: newUser,
    };
  }

  // Récupérer tous les patients (avec pagination)
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          dateOfBirth: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      message: 'Liste des utilisateurs récupérée',
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // Récupérer un patient par ID
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    return {
      message: 'Utilisateur trouvé',
      user,
    };
  }

  // Récupérer un patient par email
  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'email ${email} non trouvé`);
    }

    return {
      message: 'Utilisateur trouvé',
      user,
    };
  }

  // Mettre à jour un patient
  async update(id: string, updateUserDto: UpdateUserDto) {
    // Vérifier si l'utilisateur existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    // Si on change l'email, vérifier qu'il n'existe pas déjà
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        throw new ConflictException('Un utilisateur avec cet email existe déjà');
      }
    }

    // Préparer les données à mettre à jour
    const updateData: any = { ...updateUserDto };

    // Si on change le mot de passe, le hasher
    if (updateUserDto.password) {
      updateData.passwordHash = await this.hashPassword(updateUserDto.password);
      delete updateData.password;
    }

    // Convertir la date de naissance si fournie
    if (updateUserDto.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateUserDto.dateOfBirth);
    }

    // Mettre à jour
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser,
    };
  }

  // Désactiver un patient (soft delete)
  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    // Désactiver au lieu de supprimer
    const deactivatedUser = await this.prisma.user.update({
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
      message: 'Utilisateur désactivé avec succès',
      user: deactivatedUser,
    };
  }

  // Réactiver un patient
  async activate(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    const activatedUser = await this.prisma.user.update({
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
      message: 'Utilisateur réactivé avec succès',
      user: activatedUser,
    };
  }

  // Statistiques des patients
  async getStats() {
    const [totalUsers, activeUsers, inactiveUsers, recentUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: false } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 derniers jours
          },
        },
      }),
    ]);

    return {
      message: 'Statistiques des utilisateurs',
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        recentUsers,
        activationRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      },
    };
  }
  // =====================================================
  // 🆕 MÉTHODE SECRÉTAIRE
  // =====================================================

  /**
   * Récupérer la liste des patients pour la secrétaire
   * Avec recherche par nom, email ou téléphone
   */
 async getPatientsForSecretary(search?: string, page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  const where: any = {
    role: 'PATIENT', // Ne récupérer que les patients
  };

  // Recherche si un terme est fourni
  if (search) {
    where.OR = [
      { firstName: { contains: search } }, // ✅ CORRIGÉ
      { lastName: { contains: search } },  // ✅ CORRIGÉ
      { email: { contains: search } },     // ✅ CORRIGÉ
      { phone: { contains: search } },     // ✅ CORRIGÉ
    ];
  }

  const [patients, total] = await Promise.all([
    this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            appointments: true, // Nombre de RDV du patient
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    this.prisma.user.count({ where }),
  ]);

  // Formater les données pour inclure le nombre de RDV
  const formattedPatients = patients.map((patient) => ({
    id: patient.id,
    email: patient.email,
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone,
    dateOfBirth: patient.dateOfBirth,
    isActive: patient.isActive,
    createdAt: patient.createdAt,
    appointmentsCount: patient._count.appointments,
  }));

  return {
    message: 'Liste des patients récupérée',
    patients: formattedPatients,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
}
}