import { apiGet } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetLibraryStats = () => {
  return useQuery({
    queryKey: ["getLibraryStats"],
    queryFn: () => apiGet<LibraryStats>("/auth/stats"),
  });
};
