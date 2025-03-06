// src\video\video.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class VideoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVideoDto: CreateVideoDto) {
    return await this.prisma.video.create({
      data: createVideoDto,
    });
  }

  async findAll() {
    return await this.prisma.video.findMany({
      include: { trackRecords: true, cctv: true },
    });
  }

  async findOne(id: string) {
    return await this.prisma.video.findUnique({
      where: { id },
      include: { trackRecords: true, cctv: true },
    });
  }

  async update(id: string, updateVideoDto: UpdateVideoDto) {
    return await this.prisma.video.update({
      where: { id },
      data: updateVideoDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.video.delete({
      where: { id },
    });
  }
}
