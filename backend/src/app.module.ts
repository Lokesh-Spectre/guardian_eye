// src\app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CaseModule } from './case/case.module';
import { CctvModule } from './cctv/cctv.module';
import { TrackRecordModule } from './track_record/track_record.module';
import { TrackedObjectModule } from './tracked_object/tracked_object.module';
import { VideoModule } from './video/video.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReferenceImageModule } from './reference_image/reference_image.module';

@Module({
  imports: [
    CaseModule,
    CctvModule,
    TrackRecordModule,
    TrackedObjectModule,
    VideoModule,
    PrismaModule,
    ReferenceImageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
