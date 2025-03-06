// src\track_record\dto\track_record_response.dto.ts
import { TrackType } from '@prisma/client';

export class TrackRecordResponseDto {
  id: string;
  cctvId: string;
  videoId: string;
  trackedObjectId: string;
  referenceImageId?: string;
  type: TrackType;
  timestamp: Date;

  constructor(partial: Partial<TrackRecordResponseDto>) {
    Object.assign(this, partial);
  }
}
