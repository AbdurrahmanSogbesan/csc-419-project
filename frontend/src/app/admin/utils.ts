import { z } from "zod";

export const editBookSchema = z.object({
  ISBN: z.string({ required_error: "ISBN is required" }).min(1),
  title: z.string({ required_error: "Title is required" }).min(1),
  author: z.string({ required_error: "Author is required" }).min(1),
  category: z.array(z.string()).optional(),
  description: z.string().optional(),
  pages: z.string().optional(),
  copiesAvailable: z
    .string({ required_error: "Available copies must be 0 or greater" })
    .min(0),
  publishedYear: z.string().optional(),
  imageUrl: z.string().optional(),
  language: z.string().optional(),
});

export type BookFormValues = z.infer<typeof editBookSchema>;
