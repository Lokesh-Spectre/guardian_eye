import { Test, TestingModule } from '@nestjs/testing';
import { ReferenceImageController } from './reference_image.controller';
import { ReferenceImageService } from './reference_image.service';

describe('ReferenceImageController', () => {
  let controller: ReferenceImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferenceImageController],
      providers: [ReferenceImageService],
    }).compile();

    controller = module.get<ReferenceImageController>(ReferenceImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
