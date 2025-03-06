import { Test, TestingModule } from '@nestjs/testing';
import { CctvService } from './cctv.service';

describe('CctvService', () => {
  let service: CctvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CctvService],
    }).compile();

    service = module.get<CctvService>(CctvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
