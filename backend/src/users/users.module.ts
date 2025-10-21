import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // 🆕 AJOUTER
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({ // 🆕 AJOUTER
      secret: process.env.JWT_SECRET || 'osirix-secret-key-2025',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}