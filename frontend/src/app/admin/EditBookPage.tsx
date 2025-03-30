import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBook, useGetBookDetails, useUpdateBook } from "@/hooks/books";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { CategoryInput } from "./components/CategoryInput";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { editBookSchema } from "./utils";
import { BookFormValues } from "./utils";
import { useEffect } from "react";

export default function EditBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useGetBookDetails(id);

  const form = useForm<BookFormValues>({
    resolver: zodResolver(editBookSchema),
    mode: "onBlur",
    defaultValues: {
      category: [],
      title: "",
      author: "",
      ISBN: "",
      language: "",
      copiesAvailable: "",
      publishedYear: "",
      pages: "",
    },
  });

  const { mutate: createBook, isPending: isCreating } = useCreateBook(() => {
    navigate("/admin?tab=books");
  });

  const { mutate: updateBook, isPending: isUpdating } = useUpdateBook();

  const mutating = isCreating || isUpdating;

  const {
    formState: { isDirty, isValid },
  } = form;

  useEffect(() => {
    if (data) {
      form.reset({
        title: data.title || "",
        author: data.author || "",
        ISBN: data.ISBN || "",
        language: data.language || "",
        copiesAvailable: data.copiesAvailable.toString(),
        publishedYear: data.publishedYear?.toString() || "",
        pages: data.pages?.toString() || "",
        description: data.description || "",
        imageUrl: data.imageUrl || "",
        category: Array.isArray(data.category)
          ? data.category
          : Array.from(data.category || []),
      });
    }
  }, [data, form]);

  function onSubmit(values: BookFormValues) {
    if (id) {
      updateBook({ data: values, bookId: id });
    } else {
      createBook(values);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin?tab=books" className="text-base">
                Book Management
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-base">
              {data ? data.title : "Add Book"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mx-auto flex w-full max-w-screen-xl flex-col rounded-[10px] border-[0.8px] border-slate-400 bg-white p-4 md:p-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-2">
              <p className="text-base font-semibold">Book Information</p>
              <Separator className="h-[0.5px] bg-slate-300" />
            </div>

            <div className="grid gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter book title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author(s)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter author name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ISBN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISBN</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter unique ISBN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter language" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="copiesAvailable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Copies</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter available copies" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publishedYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Published Year</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter published year" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Pages</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter number of pages" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CategoryInput
                control={form.control}
                name="category"
                label="Categories"
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter book description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Book Cover Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        onRemove={() => field.onChange("")}
                        previewClassName="w-full aspect-[2/3] h-[400px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-center gap-5 pt-4">
              <Button
                variant="outline"
                className="w-fit"
                size="lg"
                type="button"
                onClick={() =>
                  id ? navigate("/admin?tab=books") : form.reset()
                }
                disabled={mutating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-fit"
                size="lg"
                disabled={!isDirty || !isValid || mutating}
                loading={mutating}
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
