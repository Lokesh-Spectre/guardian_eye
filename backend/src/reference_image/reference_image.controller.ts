// src\reference_image\reference_image.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ReferenceImageService } from './reference_image.service';
import { CreateReferenceImageDto } from './dto/create-reference_image.dto';
import { UpdateReferenceImageDto } from './dto/update-reference_image.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('reference-image')
export class ReferenceImageController {
  constructor(private readonly referenceImageService: ReferenceImageService) {}

  @Post()
  async create(@Body() createReferenceImageDto: CreateReferenceImageDto) {
    return this.referenceImageService.create({
      ...createReferenceImageDto,
    });
  }

  @Get()
  findAll() {
    return this.referenceImageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.referenceImageService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReferenceImageDto: UpdateReferenceImageDto,
  ) {
    return this.referenceImageService.update(id, updateReferenceImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.referenceImageService.remove(id);
  }
}
