// src\track_record\dto\create-track_record.dto.ts
import { IsDate, IsEnum, IsOptional, IsString, IsArray } from 'class-validator';
import { TrackType } from '@prisma/client';

export class CreateTrackRecordDto {
  @IsString()
  cctvId: string;

  @IsString()
  videoId: string;

  @IsString()
  trackedObjectId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  referenceImageIds?: string[];

  @IsEnum(TrackType)
  type: TrackType;

  @IsDate()
  timestamp: Date;
}
