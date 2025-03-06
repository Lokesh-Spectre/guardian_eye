import { Test, TestingModule } from '@nestjs/testing';
import { TrackRecordController } from './track_record.controller';
import { TrackRecordService } from './track_record.service';

describe('TrackRecordController', () => {
  let controller: TrackRecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrackRecordController],
      providers: [TrackRecordService],
    }).compile();

    controller = module.get<TrackRecordController>(TrackRecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
