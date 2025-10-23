import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  imageReview: f({
    image: {
      /**
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 4,
    },
  }).onUploadComplete(async ({ metadata, file }) => {
    console.log("Upload complete for file:", file);
    console.log("User metadata:", metadata);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
