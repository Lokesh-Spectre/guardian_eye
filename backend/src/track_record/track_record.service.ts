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
      data: createTrackRecordDto,
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
      data: updateTrackRecordDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.trackRecord.delete({
      where: { id },
    });
  }
}
