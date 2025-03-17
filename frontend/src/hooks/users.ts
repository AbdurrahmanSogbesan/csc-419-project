import { apiGet } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetUsers = (params: GetUsersParams) => {
  return useQuery({
    queryKey: ["getUsers", params],
    queryFn: () => apiGet<GetUsersReponse>("/auth", { params }),
  });
};

export const useGetAuthUser = () => {
  return useQuery({
    queryKey: ["getAuthUser"],
    queryFn: () => apiGet<User>("/auth/me"),
  });
};
