// src\track_record\track_record.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TrackRecordService } from './track_record.service';
import { CreateTrackRecordDto } from './dto/create-track_record.dto';
import { UpdateTrackRecordDto } from './dto/update-track_record.dto';

@Controller('track-record')
export class TrackRecordController {
  constructor(private readonly trackRecordService: TrackRecordService) {}

  @Post()
  create(@Body() createTrackRecordDto: CreateTrackRecordDto) {
    return this.trackRecordService.create(createTrackRecordDto);
  }

  @Get()
  findAll() {
    return this.trackRecordService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trackRecordService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTrackRecordDto: UpdateTrackRecordDto,
  ) {
    return this.trackRecordService.update(id, updateTrackRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trackRecordService.remove(id);
  }
}
