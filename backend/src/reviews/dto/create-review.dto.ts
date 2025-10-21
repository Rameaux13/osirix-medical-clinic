// C:\Users\DELL\Desktop\osirix\backend\src\reviews\dto\create-review.dto.ts

import { IsNotEmpty, IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty({ message: 'Le rating est obligatoire' })
  @IsInt({ message: 'Le rating doit être un nombre entier' })
  @Min(1, { message: 'Le rating minimum est de 1 étoile' })
  @Max(5, { message: 'Le rating maximum est de 5 étoiles' })
  rating: number;

  @IsOptional()
  @IsString({ message: 'Le commentaire doit être une chaîne de caractères' })
  @MaxLength(1000, { message: 'Le commentaire ne peut pas dépasser 1000 caractères' })
  comment?: string;

  @IsOptional()
  @IsString()
  type?: string = 'clinic';
}