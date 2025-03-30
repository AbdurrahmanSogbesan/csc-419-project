import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { UTApi } from 'uploadthing/server';

@Injectable()
export class UploadService {
  private logger = new Logger(UploadService.name);
  private utapi: UTApi;

  constructor() {
    this.utapi = new UTApi({
      token: process.env.UPLOADTHING_TOKEN,
      logFormat: 'pretty',
    });
  }

  async uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.logger.log(
      `Received file: ${file.originalname}, Size: ${file.size} bytes, Type: ${file.mimetype}`,
    );

    // Convert to File object
    const fileObject = new File([file.buffer], file.originalname, {
      type: file.mimetype,
    });

    // Upload to UploadThing
    const result = await this.utapi.uploadFiles(fileObject);

    if (result.error) {
      console.error('Upload error:', result.error);
      throw new BadRequestException(result.error);
    }

    // Extract details
    const { ufsUrl, name, size } = result.data;

    return {
      url: ufsUrl,
      name,
      size,
    };
  }
}
