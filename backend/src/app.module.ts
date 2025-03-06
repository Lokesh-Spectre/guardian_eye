import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CaseResolver } from './case/case.resolver';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, CaseResolver],
})
export class AppModule {}
