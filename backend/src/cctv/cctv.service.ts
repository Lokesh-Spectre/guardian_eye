// src\cctv\cctv.service.ts
import { Injectable } from '@nestjs/common';
import { CreateCctvDto } from './dto/create-cctv.dto';
import { UpdateCctvDto } from './dto/update-cctv.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CctvService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCctvDto: CreateCctvDto) {
    return await this.prisma.cCTV.create({
      data: createCctvDto,
    });
  }

  async findAll() {
    return await this.prisma.cCTV.findMany({
      include: { videos: true, trackRecords: true },
    });
  }

  async findOne(id: string) {
    return await this.prisma.cCTV.findUnique({
      where: { id },
      include: { videos: true, trackRecords: true },
    });
  }

  async update(id: string, updateCctvDto: UpdateCctvDto) {
    return await this.prisma.cCTV.update({
      where: { id },
      data: updateCctvDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.cCTV.delete({
      where: { id },
    });
  }
}
