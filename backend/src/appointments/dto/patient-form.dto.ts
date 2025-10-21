import { IsNotEmpty, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';

export class PatientFormDto {
  // Motif de consultation
  @IsOptional()
  chiefComplaint?: string;

  // Symptômes ressentis
  @IsOptional()
  symptoms?: string;

  // Niveau de douleur (1-10)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  painLevel?: number;

  // Localisation de la douleur
  @IsOptional()
  painLocation?: string;

  // Durée des symptômes
  @IsOptional()
  symptomsDuration?: string;

  // Antécédents médicaux
  @IsOptional()
  medicalHistory?: string;

  // Médicaments actuels
  @IsOptional()
  currentMedications?: string;

  // Allergies
  @IsOptional()
  allergies?: string;

  // Antécédents familiaux
  @IsOptional()
  familyMedicalHistory?: string;

  // Informations sur le mode de vie
  @IsOptional()
  lifestyleInfo?: string;

  // Informations complémentaires
  @IsOptional()
  additionalInfo?: string;
}