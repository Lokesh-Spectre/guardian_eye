import { Test, TestingModule } from '@nestjs/testing';
import { TrackRecordService } from './track_record.service';

describe('TrackRecordService', () => {
  let service: TrackRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackRecordService],
    }).compile();

    service = module.get<TrackRecordService>(TrackRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
