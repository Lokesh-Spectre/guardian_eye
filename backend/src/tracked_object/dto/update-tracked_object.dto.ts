// src\tracked_object\dto\update-tracked_object.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTrackedObjectDto } from './create-tracked_object.dto';

export class UpdateTrackedObjectDto extends PartialType(
  CreateTrackedObjectDto,
) {}
