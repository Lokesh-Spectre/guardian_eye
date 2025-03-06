import { Module } from '@nestjs/common';
import { TrackedObjectService } from './tracked_object.service';
import { TrackedObjectController } from './tracked_object.controller';

@Module({
  controllers: [TrackedObjectController],
  providers: [TrackedObjectService],
})
export class TrackedObjectModule {}
