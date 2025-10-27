import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'osirix-secret-key-2025',
    });
  }

  async validate(payload: any) {
    // Le payload contient les données du JWT (userId, email, userType)
    
    // Rechercher l'utilisateur selon son type
    if (payload.userType === 'patient') {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          dateOfBirth: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      return {
        ...user,
        userId: user.id, // Ajouter userId pour le contrôleur
        userType: 'patient',
      };
    }

    if (payload.userType === 'doctor') {
      const user = await this.prisma.doctor.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          speciality: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      return {
        ...user,
        userId: user.id, // Ajouter userId pour le contrôleur
        userType: 'doctor',
      };
    }

    if (payload.userType === 'admin') {
      const user = await this.prisma.admin.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      return {
        ...user,
        userId: user.id, // Ajouter userId pour le contrôleur
        userType: 'admin',
      };
    }

    throw new UnauthorizedException('Type d\'utilisateur non valide');
  }
}