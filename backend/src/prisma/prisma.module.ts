// src\prisma\prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 👈 Makes the module globally available
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 👈 Exporting the service
})
export class PrismaModule {}
