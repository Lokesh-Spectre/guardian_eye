import { Test, TestingModule } from '@nestjs/testing';
import { CctvController } from './cctv.controller';
import { CctvService } from './cctv.service';

describe('CctvController', () => {
  let controller: CctvController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CctvController],
      providers: [CctvService],
    }).compile();

    controller = module.get<CctvController>(CctvController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
