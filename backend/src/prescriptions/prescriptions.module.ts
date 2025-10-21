// ============================================================================
// OSIRIX CLINIQUE MÉDICAL - MODULE PRESCRIPTIONS
// Module principal pour gestion des prescriptions médicales
// Créé le: 24/09/2025
// ============================================================================

import { Module } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsController } from './prescriptions.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module'; // Pour notifier les patients

@Module({
  imports: [NotificationsModule], // Import du module notifications
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService, PrismaService], // PrismaService comme provider
  exports: [PrescriptionsService], // Exporté pour utilisation dans d'autres modules
})
export class PrescriptionsModule {}