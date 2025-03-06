import { Test, TestingModule } from '@nestjs/testing';
import { TrackedObjectService } from './tracked_object.service';

describe('TrackedObjectService', () => {
  let service: TrackedObjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackedObjectService],
    }).compile();

    service = module.get<TrackedObjectService>(TrackedObjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
