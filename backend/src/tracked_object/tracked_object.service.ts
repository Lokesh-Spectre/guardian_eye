// src\tracked_object\tracked_object.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrackedObjectDto } from './dto/create-tracked_object.dto';
import { UpdateTrackedObjectDto } from './dto/update-tracked_object.dto';

@Injectable()
export class TrackedObjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTrackedObjectDto: CreateTrackedObjectDto) {
    return await this.prisma.trackedObject.create({
      data: {
        ...createTrackedObjectDto,
        referenceImages: createTrackedObjectDto.referenceImageIds
          ? {
              connect: createTrackedObjectDto.referenceImageIds.map((id) => ({
                id,
              })),
            }
          : undefined,
      },
      include: { referenceImages: true, cases: true, trackRecords: true },
    });
  }

  async findAll() {
    return await this.prisma.trackedObject.findMany({
      include: { referenceImages: true, cases: true, trackRecords: true },
    });
  }

  async findOne(id: string) {
    return await this.prisma.trackedObject.findUnique({
      where: { id },
      include: { referenceImages: true, cases: true, trackRecords: true },
    });
  }

  async update(id: string, updateTrackedObjectDto: UpdateTrackedObjectDto) {
    return await this.prisma.trackedObject.update({
      where: { id },
      data: {
        ...updateTrackedObjectDto,
        referenceImages: updateTrackedObjectDto.referenceImageIds
          ? {
              set: updateTrackedObjectDto.referenceImageIds.map((id) => ({
                id,
              })),
            }
          : undefined,
      },
      include: { referenceImages: true, cases: true, trackRecords: true },
    });
  }

  async remove(id: string) {
    return await this.prisma.trackedObject.delete({
      where: { id },
    });
  }
}
