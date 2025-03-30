import { apiDelete, apiGet, apiPost } from "@/lib/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetBooks = (
  params: GetBooksQueryParams,
  extraQueryKey?: unknown[],
  options?: Omit<UseQueryOptions<GetBooksResponse>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: ["getBooks", params, extraQueryKey],
    queryFn: () => apiGet<GetBooksResponse>("/books", { params }),
    ...options,
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
    mutationKey: ["saveBook"],
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
    mutationKey: ["deleteSavedBook"],
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

export const useReserveBook = (
  onSuccess?: (data: { message: string; reservation: Reservation }) => void,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["reserveBook"],
    mutationFn: (bookId: string) =>
      apiPost<{ message: string; reservation: Reservation }>(
        `/reservation/${bookId}/reserve`,
      ),
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ["getBooks"] });
      queryClient.refetchQueries({ queryKey: ["getSavedBooks"] });
      queryClient.refetchQueries({ queryKey: ["getReservedBooks"] });
      toast.success(data.message || "Book reserved successfully");
      onSuccess?.(data);
    },
    onError(error) {
      console.log(error);
      toast.error("Failed to reserve book");
    },
  });
};

export const useGetReservedBooks = (params: GetReservedBooksQueryParams) => {
  return useQuery({
    queryKey: ["getReservedBooks", params],
    queryFn: () =>
      apiGet<{ data: Reservation[]; pagination: Pagination }>("/reservation", {
        params,
      }),
  });
};

export const useDeleteBook = (onSuccess?: VoidFunction) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteBook"],
    mutationFn: (bookId: string) => apiDelete<Book>(`/books/${bookId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getBooks"], exact: false });
      queryClient.refetchQueries({ queryKey: ["getLibraryStats"] });
      toast.success("Book deleted successfully");
      onSuccess?.();
    },
    onError(error) {
      console.log(error);
      toast.error("Failed to delete book");
    },
  });
};
