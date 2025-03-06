// src\reference_image\dto\create-reference_image.dto.ts
import { IsString, IsEnum } from 'class-validator';
import { ObjectType } from '@prisma/client';

export class CreateReferenceImageDto {
  @IsString()
  path: string;

  @IsEnum(ObjectType)
  type: ObjectType;

  @IsString()
  trackedObjectId: string;
}
