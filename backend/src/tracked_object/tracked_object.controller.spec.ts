import { Test, TestingModule } from '@nestjs/testing';
import { TrackedObjectController } from './tracked_object.controller';
import { TrackedObjectService } from './tracked_object.service';

describe('TrackedObjectController', () => {
  let controller: TrackedObjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrackedObjectController],
      providers: [TrackedObjectService],
    }).compile();

    controller = module.get<TrackedObjectController>(TrackedObjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
