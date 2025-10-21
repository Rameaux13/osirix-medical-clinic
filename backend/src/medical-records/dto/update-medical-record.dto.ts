import { IsOptional, IsBoolean, IsIn } from 'class-validator';

export class UpdateMedicalRecordDto {
  @IsOptional()
  @IsIn(['consultation', 'prescription', 'lab_result', 'document', 'upload'])
  recordType?: string;

  @IsOptional()
  title?: string;

  @IsOptional()
  content?: string;

  @IsOptional()
  fileUrl?: string;

  @IsOptional()
  fileName?: string;

  @IsOptional()
  fileSize?: number;

  @IsOptional()
  fileType?: string;

  @IsOptional()
  @IsBoolean()
  isVisibleToPatient?: boolean;

  @IsOptional()
  tags?: string;
}