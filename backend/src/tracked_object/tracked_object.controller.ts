// src\tracked_object\tracked_object.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TrackedObjectService } from './tracked_object.service';
import { CreateTrackedObjectDto } from './dto/create-tracked_object.dto';
import { UpdateTrackedObjectDto } from './dto/update-tracked_object.dto';

@Controller('tracked-object')
export class TrackedObjectController {
  constructor(private readonly trackedObjectService: TrackedObjectService) {}

  @Post()
  create(@Body() createTrackedObjectDto: CreateTrackedObjectDto) {
    return this.trackedObjectService.create(createTrackedObjectDto);
  }

  @Get()
  findAll() {
    return this.trackedObjectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trackedObjectService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTrackedObjectDto: UpdateTrackedObjectDto,
  ) {
    return this.trackedObjectService.update(id, updateTrackedObjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trackedObjectService.remove(id);
  }
}
