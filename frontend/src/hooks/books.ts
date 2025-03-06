import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetBooks = (params: GetBooksQueryParams) => {
  return useQuery({
    queryKey: ["getBooks", params],
    queryFn: () => apiGet<Book[]>("/books", { params }),
  });
};

export const useSaveBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => apiPost<Book[]>(`/books/${bookId}/save`),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["getBooks"] });
      toast.success("Book saved successfully");
    },
    onError(error) {
      console.log(error);
      toast.error("Failed to save book");
    },
  });
};

export const useDeleteSavedBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => apiDelete<Book[]>(`/books/saved/${bookId}`),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["getBooks"] });
      toast.success("Saved book deleted successfully");
    },
    onError(error) {
      console.log(error);
      toast.error("Failed to remove book from saved");
    },
  });
};
