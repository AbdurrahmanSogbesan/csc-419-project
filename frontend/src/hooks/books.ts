import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetBooks = (params: GetBooksQueryParams) => {
  return useQuery({
    queryKey: ["getBooks", params],
    queryFn: () => apiGet<Book[]>("/books", { params }),
  });
};

export const useSaveBook = (onSuccess?: (data: Book[]) => void) => {
  return useMutation({
    mutationFn: (bookId: string) => apiPost<Book[]>(`/books/${bookId}/save`),
    onSuccess: (data) => onSuccess?.(data),
    onError(error) {
      console.log(error);
      toast.error("Failed to save book");
    },
  });
};

export const useDeleteSavedBook = (onSuccess?: (data: Book[]) => void) => {
  return useMutation({
    mutationFn: (bookId: string) => apiDelete<Book[]>(`/books/saved/${bookId}`),
    onSuccess: (data) => onSuccess?.(data),
    onError(error) {
      console.log(error);
      toast.error("Failed to remove book from saved");
    },
  });
};

export const useGetBookDetails = (bookId?: string) => {
  return useQuery({
    queryKey: ["getBookDetails", bookId],
    queryFn: () => apiGet<Book>(`/books/${bookId}`),
    enabled: !!bookId,
  });
};
