// src\tracked_object\dto\create-tracked_object.dto.ts
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';
import { ObjectType } from '@prisma/client';

export class CreateTrackedObjectDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ObjectType)
  type: ObjectType;

  @IsDateString()
  lastSeenTimestamp: Date;

  @IsOptional()
  @IsString()
  currentLocation?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  referenceImageIds?: string[]; // Storing reference image IDs since they are related
}
