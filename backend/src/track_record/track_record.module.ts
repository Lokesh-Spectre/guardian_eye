import { Module } from '@nestjs/common';
import { TrackRecordService } from './track_record.service';
import { TrackRecordController } from './track_record.controller';

@Module({
  controllers: [TrackRecordController],
  providers: [TrackRecordService],
})
export class TrackRecordModule {}
