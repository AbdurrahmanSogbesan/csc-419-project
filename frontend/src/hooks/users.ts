import { SettingsProfileForm } from "@/app/settings";
import { apiGet, apiPatch } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

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

export const useUpdateUser = (userId: string, onSuccess?: VoidFunction) => {
  return useMutation({
    mutationKey: ["updateUser", userId],
    mutationFn: (data: Partial<SettingsProfileForm>) =>
      apiPatch<User>(`/auth/${userId}`, data),
    onSuccess: (data) => {
      const { email, name, phone } = data;

      // update state user with new data
      const user = useAuthStore.getState().user;

      if (user) {
        useAuthStore.setState({
          user: {
            ...user,
            email,
            name,
            phone,
          },
        });
      }
      onSuccess?.();
      toast.success("User updated successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to update profile");
    },
  });
};

export const useGetNotifications = (params: GetNotificationsParams) => {
  return useQuery({
    queryKey: ["getNotifications", params],
    queryFn: () =>
      apiGet<GetNotificationsResponse>("/notifications", { params }),
    refetchInterval: 5 * 60 * 1000, // 5 mins,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["markNotificationAsRead"],
    mutationFn: (notificationId: number) =>
      apiPatch(`/notifications/${notificationId}/read`),
    onSuccess: () => {
      toast.success("Notification marked as read");
      queryClient.refetchQueries({
        queryKey: ["getNotifications"],
      });
    },
    onError: () => {
      toast.error("Failed to mark notification as read");
    },
  });
};

export const useRestrictUser = (onSuccess?: VoidFunction) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["restrictUser"],
    mutationFn: ({
      userId,
      restrictionDate,
    }: {
      userId: string;
      restrictionDate?: string;
    }) =>
      apiPatch<User>(`/auth/${userId}/restrict`, {
        restrictionDate,
      }),
    onSuccess: () => {
      toast.success("User restricted successfully");
      queryClient.refetchQueries({
        queryKey: ["getUsers"],
      });
      onSuccess?.();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to restrict user");
    },
  });
};

export const useUnrestrictUser = (onSuccess?: VoidFunction) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["unrestrictUser"],
    mutationFn: (userId: string) =>
      apiPatch<User>(`/auth/${userId}/unrestrict`),
    onSuccess: () => {
      toast.success("User unrestricted successfully");
      queryClient.refetchQueries({
        queryKey: ["getUsers"],
      });
      onSuccess?.();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error?.response?.data?.message || "Failed to unrestrict user",
      );
    },
  });
};
