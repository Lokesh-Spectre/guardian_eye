// src\reference_image\dto\update-reference_image.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateReferenceImageDto } from './create-reference_image.dto';

export class UpdateReferenceImageDto extends PartialType(
  CreateReferenceImageDto,
) {}
