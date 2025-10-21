// ============================================================================
// OSIRIX CLINIQUE MÉDICAL - MODULE PRESCRIPTIONS  
// DTO pour mise à jour de prescriptions
// Créé le: 24/09/2025
// ============================================================================

import { PartialType } from '@nestjs/mapped-types';
import { CreatePrescriptionDto } from './create-prescription.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}