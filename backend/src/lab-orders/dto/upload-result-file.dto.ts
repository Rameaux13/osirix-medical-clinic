import { IsNotEmpty, IsString } from 'class-validator';

export class UploadResultFileDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  fileType: string;
}