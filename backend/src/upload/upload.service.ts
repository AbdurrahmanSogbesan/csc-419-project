import { Injectable } from '@nestjs/common';
import { UTApi } from 'uploadthing/server';
import { Express } from 'express';

@Injectable()
export class UploadService {
  private utapi: UTApi;

  constructor() {
    this.utapi = new UTApi({
      token: process.env.UPLOADTHING_TOKEN,
      logFormat: 'pretty',
    });
  }

  async uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    console.log('File received:', file);

    // Convert to File object
    const fileObject = new File([file.buffer], file.originalname, {
      type: file.mimetype,
    });

    // Upload to UploadThing
    const result = await this.utapi.uploadFiles(fileObject);

    if (result.error) {
      console.error('Upload error:', result.error);
      throw result.error;
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
