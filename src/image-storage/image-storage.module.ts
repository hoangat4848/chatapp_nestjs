import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Services } from 'src/utils/constants';
import { CloudinaryProvider } from './cloudinary.provider';
import { ImageStorageService } from './image-storage.service';

@Module({
  imports: [ConfigModule],
  providers: [
    CloudinaryProvider,
    {
      provide: Services.IMAGE_STORAGE,
      useClass: ImageStorageService,
    },
  ],
  exports: [
    {
      provide: Services.IMAGE_STORAGE,
      useClass: ImageStorageService,
    },
  ],
})
export class ImageStorageModule {}
