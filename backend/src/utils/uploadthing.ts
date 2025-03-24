import { createUploadthing } from 'uploadthing/express';

const f = createUploadthing();

export const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .onUploadError(({ error, fileKey }) => {
      console.log('error', error);
      console.error(`Error uploading file: ${error.message}, ${fileKey}`);
    })
    .onUploadComplete(({ file }) => {
      return {
        url: file.ufsUrl,
        name: file.name,
        size: file.size,
      };
    }),
};

export type OurFileRouter = typeof uploadRouter;
