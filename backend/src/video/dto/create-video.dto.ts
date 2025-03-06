// src\video\dto\create-video.dto.ts
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  cctvId: string;

  @IsDateString()
  videoStartTime: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  path: string;
}
