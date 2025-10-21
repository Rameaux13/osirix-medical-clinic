// ============================================================================
// OSIRIX CLINIQUE MÉDICAL - MODULE PRESCRIPTIONS
// DTO pour création de prescriptions
// Créé le: 24/09/2025
// ============================================================================

import { IsString, IsOptional, IsNotEmpty, IsJSON } from 'class-validator';

export class CreatePrescriptionDto {
  @IsString()
  @IsNotEmpty({ message: 'L\'ID de consultation est obligatoire' })
  consultationId: string;

  @IsString()
  @IsNotEmpty({ message: 'Les médicaments sont obligatoires' })
  medications: string; // JSON string contenant la liste des médicaments

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsString()
  @IsOptional()
  pharmacyNotes?: string;
}

// Interface pour typer les médicaments (JSON)
export interface MedicationItem {
  name: string;          // Nom du médicament
  dosage: string;        // Posologie (ex: "2 comprimés")
  frequency: string;     // Fréquence (ex: "matin et soir")
  duration: string;      // Durée (ex: "7 jours")
  instructions?: string; // Instructions spécifiques
}