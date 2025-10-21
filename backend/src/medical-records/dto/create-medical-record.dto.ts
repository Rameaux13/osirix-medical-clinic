import { IsNotEmpty, IsOptional, IsBoolean, IsIn, IsNumber, IsPositive } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  doctorId?: string;

  @IsOptional()
  consultationId?: string;

  @IsNotEmpty()
  @IsIn([
    'consultation', 
    'prescription', 
    'lab_result', 
    'document', 
    'upload',
    'analysis',           // Résultats d'analyses
    'radiology',          // Radiographies, IRM, Scanner
    'invoice',            // Factures médicales
    'medical_certificate', // Certificats médicaux
    'insurance',          // Documents d'assurance
    'vaccination',        // Carnets de vaccination
    'other'              // Autres documents
  ])
  recordType: string;

  @IsNotEmpty()
  title: string;

  @IsOptional()
  content?: string;

  @IsOptional()
  fileUrl?: string;

  @IsOptional()
  fileName?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  fileSize?: number;

  @IsOptional()
  fileType?: string;

  @IsOptional()
  @IsBoolean()
  isVisibleToPatient?: boolean;

  @IsOptional()
  tags?: string;

  @IsOptional()
  description?: string;  // Nouvelle propriété pour description détaillée
}