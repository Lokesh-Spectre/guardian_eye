// src\cctv\cctv.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CctvService } from './cctv.service';
import { CreateCctvDto } from './dto/create-cctv.dto';
import { UpdateCctvDto } from './dto/update-cctv.dto';

@Controller('cctv')
export class CctvController {
  constructor(private readonly cctvService: CctvService) {}

  @Post()
  create(@Body() createCctvDto: CreateCctvDto) {
    return this.cctvService.create(createCctvDto);
  }

  @Get()
  findAll() {
    return this.cctvService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cctvService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCctvDto: UpdateCctvDto) {
    return this.cctvService.update(id, updateCctvDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cctvService.remove(id);
  }
}
