// src\track_record\dto\update-track_record.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTrackRecordDto } from './create-track_record.dto';

export class UpdateTrackRecordDto extends PartialType(CreateTrackRecordDto) {}
