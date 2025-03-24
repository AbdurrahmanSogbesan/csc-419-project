import { Injectable, Logger } from '@nestjs/common';
import { createUploadthing, type FileRouter } from 'uploadthing/server';

const f = createUploadthing();

@Injectable()
export class UploadService {
  private logger = new Logger(UploadService.name);
  constructor() {}
  uploadRouter: FileRouter = {
    // Only allow image uploads for book covers
    imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
      .onUploadError(({ error, fileKey }) => {
        console.log('error', error);
        this.logger.error(`Error uploading file: ${error.message}, ${fileKey}`);
      })
      .onUploadComplete(({ file }) => {
        return {
          url: file.ufsUrl,
          name: file.name,
          size: file.size,
        };
      }),
  };
}
