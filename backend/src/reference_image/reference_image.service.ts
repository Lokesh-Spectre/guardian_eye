// src\reference_image\reference_image.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReferenceImageDto } from './dto/create-reference_image.dto';
import { UpdateReferenceImageDto } from './dto/update-reference_image.dto';

@Injectable()
export class ReferenceImageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createReferenceImageDto: CreateReferenceImageDto & { path: string },
  ) {
    return await this.prisma.referenceImage.create({
      data: createReferenceImageDto,
    });
  }

  async findAll() {
    return await this.prisma.referenceImage.findMany({
      include: { trackedObject: true, TrackRecord: true },
    });
  }

  async findOne(id: string) {
    return await this.prisma.referenceImage.findUnique({
      where: { id },
      include: { trackedObject: true, TrackRecord: true },
    });
  }

  async update(id: string, updateReferenceImageDto: UpdateReferenceImageDto) {
    return await this.prisma.referenceImage.update({
      where: { id },
      data: updateReferenceImageDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.referenceImage.delete({
      where: { id },
    });
  }
}
