import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { StaffRegisterDto } from './dto/staff-register.dto';
import { StaffLoginDto } from './dto/staff-login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthStaffService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Inscription du personnel (Staff)
   */
  async register(dto: StaffRegisterDto) {
    // Vérifier si l'email existe déjà
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Normaliser le téléphone (retirer espaces)
    const normalizedPhone = dto.phone.replace(/\s+/g, '');

    // Vérifier si le téléphone existe déjà
    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (existingPhone) {
      throw new ConflictException('Ce numéro de téléphone est déjà utilisé');
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Créer l'utilisateur staff
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: normalizedPhone,
        role: dto.role, // SECRETARY, DOCTOR, LABORANTIN
        gender: dto.gender,
        isActive: true,
      },
    });

    // Générer le token JWT
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Inscription réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        gender: user.gender,
      },
    };
  }

  /**
   * Connexion du personnel (Staff)
   * Accepte email OU téléphone + mot de passe
   */
  async login(dto: StaffLoginDto) {
    // Validation : au moins email OU téléphone doit être fourni
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Vous devez fournir un email ou un numéro de téléphone');
    }

    let user;

    // Recherche par email
    if (dto.email) {
      user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
    }
    // Recherche par téléphone
    else if (dto.phone) {
      const normalizedPhone = dto.phone.replace(/\s+/g, '');
      user = await this.prisma.user.findUnique({
        where: { phone: normalizedPhone },
      });
    }

    // Vérifier si l'utilisateur existe
    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    // Vérifier si c'est un membre du personnel (pas un patient)
    if (user.role === 'PATIENT') {
      throw new UnauthorizedException('Accès réservé au personnel uniquement');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      throw new UnauthorizedException('Votre compte a été désactivé');
    }

    // Générer le token JWT
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        gender: user.gender,
      },
    };
  }
}