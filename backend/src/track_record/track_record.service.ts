// src\track_record\track_record.service.ts
import { Injectable } from '@nestjs/common';
import { CreateTrackRecordDto } from './dto/create-track_record.dto';
import { UpdateTrackRecordDto } from './dto/update-track_record.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrackRecordService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTrackRecordDto: CreateTrackRecordDto) {
    return await this.prisma.trackRecord.create({
      data: {
        cctvId: createTrackRecordDto.cctvId,
        videoId: createTrackRecordDto.videoId,
        trackedObjectId: createTrackRecordDto.trackedObjectId,
        referenceImageId: createTrackRecordDto.referenceImageIds
          ? createTrackRecordDto.referenceImageIds[0] // Assuming a single reference image for now
          : undefined,
        type: createTrackRecordDto.type,
        timestamp: createTrackRecordDto.timestamp,
      },
    });
  }

  async findAll() {
    return await this.prisma.trackRecord.findMany({
      include: {
        cctv: true,
        video: true,
        trackedObject: true,
        referenceImage: true,
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.trackRecord.findUnique({
      where: { id },
      include: {
        cctv: true,
        video: true,
        trackedObject: true,
        referenceImage: true,
      },
    });
  }

  async update(id: string, updateTrackRecordDto: UpdateTrackRecordDto) {
    return await this.prisma.trackRecord.update({
      where: { id },
      data: {
        cctvId: updateTrackRecordDto.cctvId,
        videoId: updateTrackRecordDto.videoId,
        trackedObjectId: updateTrackRecordDto.trackedObjectId,
        referenceImageId: updateTrackRecordDto.referenceImageIds
          ? updateTrackRecordDto.referenceImageIds[0] // Assuming a single reference image for now
          : undefined,
        type: updateTrackRecordDto.type,
        timestamp: updateTrackRecordDto.timestamp,
      },
    });
  }

  async remove(id: string) {
    return await this.prisma.trackRecord.delete({
      where: { id },
    });
  }
}
