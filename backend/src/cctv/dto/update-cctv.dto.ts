// src\cctv\dto\update-cctv.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCctvDto } from './create-cctv.dto';

export class UpdateCctvDto extends PartialType(CreateCctvDto) {}
