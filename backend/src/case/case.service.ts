// src\case\case.service.ts
import { Injectable } from '@nestjs/common';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CaseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCaseDto: CreateCaseDto) {
    return await this.prisma.case.create({
      data: createCaseDto,
    });
  }

  async findAll() {
    return await this.prisma.case.findMany({
      include: { trackedObjects: true },
    });
  }

  async findOne(id: string) {
    return await this.prisma.case.findUnique({
      where: { id },
      include: { trackedObjects: true },
    });
  }

  async update(id: string, updateCaseDto: UpdateCaseDto) {
    return await this.prisma.case.update({
      where: { id },
      data: updateCaseDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.case.delete({
      where: { id },
    });
  }
}
