import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetBooks = (params: GetBooksQueryParams) => {
  return useQuery({
    queryKey: ["getBooks", params],
    queryFn: () => apiGet<Book[]>("/books", { params }),
  });
};

export const useGetSavedBooks = (params: GetBooksQueryParams) => {
  return useQuery({
    queryKey: ["getSavedBooks", params],
    queryFn: () => apiGet<SavedBook[]>("/books/saved", { params }),
  });
};

export const useSaveBook = (onSuccess?: (data: Book[]) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => apiPost<Book[]>(`/books/${bookId}/save`),
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ["getSavedBooks"] });
      queryClient.refetchQueries({ queryKey: ["getBooks"] });
      onSuccess?.(data);
    },
    onError(error) {
      console.log(error);
      toast.error("Failed to save book");
    },
  });
};

export const useDeleteSavedBook = (onSuccess?: (data: Book[]) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => apiDelete<Book[]>(`/books/saved/${bookId}`),
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ["getSavedBooks"] });
      queryClient.refetchQueries({ queryKey: ["getBooks"] });
      onSuccess?.(data);
    },
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
