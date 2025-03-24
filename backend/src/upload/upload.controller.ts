import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UTApi } from 'uploadthing/server';
import { Express } from 'express';

// const uploadRouter =  satisfies FileRouter;
const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN,
  logFormat: 'pretty',
});

@Controller()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async handleUpload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: 'No file uploaded' };
    }

    console.log('File received:', file);

    const fileObject = new File([file.buffer], file.originalname, {
      type: file.mimetype,
    });

    const result = await utapi.uploadFiles(fileObject);

    if (result.error) {
      console.log('error', result.error);
      return {
        error: result.error,
      };
    }

    const { ufsUrl, name, size } = result.data;

    return {
      url: ufsUrl,
      name,
      size,
    };
  }
}
