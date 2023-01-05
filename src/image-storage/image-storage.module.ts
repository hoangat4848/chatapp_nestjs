import { Module } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { ImageStorageService } from './image-storage.service';

@Module({
  providers: [
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
