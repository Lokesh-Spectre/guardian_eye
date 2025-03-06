import { Module } from '@nestjs/common';
import { CctvService } from './cctv.service';
import { CctvController } from './cctv.controller';

@Module({
  controllers: [CctvController],
  providers: [CctvService],
})
export class CctvModule {}
