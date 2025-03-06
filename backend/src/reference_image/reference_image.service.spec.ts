import { Test, TestingModule } from '@nestjs/testing';
import { ReferenceImageService } from './reference_image.service';

describe('ReferenceImageService', () => {
  let service: ReferenceImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReferenceImageService],
    }).compile();

    service = module.get<ReferenceImageService>(ReferenceImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
