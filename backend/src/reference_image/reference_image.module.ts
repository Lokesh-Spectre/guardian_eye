// src\reference_image\reference_image.module.ts
import { Module } from '@nestjs/common';
import { ReferenceImageService } from './reference_image.service';
import { ReferenceImageController } from './reference_image.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './photos',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  ],
  controllers: [ReferenceImageController],
  providers: [ReferenceImageService],
})
export class ReferenceImageModule {}
