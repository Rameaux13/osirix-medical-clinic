import { IsString, IsNotEmpty, IsOptional, IsArray, IsDateString } from 'class-validator';

export class SendLabOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'L\'ID du patient est obligatoire' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'Le type d\'examen est obligatoire' })
  examType: string; // "Prise de sang", "Radio", "Scanner", "IRM", "Échographie"

  @IsDateString()
  @IsNotEmpty({ message: 'La date de l\'analyse est obligatoire' })
  orderDate: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  results?: string;

  @IsOptional()
  @IsArray()
  resultFiles?: any[]; // Array de fichiers [{url, type, name}]
}