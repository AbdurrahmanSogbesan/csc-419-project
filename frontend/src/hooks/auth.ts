import { LoginForm, RegisterForm } from "@/app/auth/utils";
import { SettingsPasswordForm } from "@/app/settings/utils";
import { apiPatch, apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function useRegister() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["register"],
    mutationFn: async (data: RegisterForm) => {
      const { confirmPassword, ...rest } = data;

      return await apiPost<AuthResponse>("/auth/register", rest);
    },
    onSuccess: async (data) => {
      login(data);
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
      console.error(error);
    },
  });
}

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (data: LoginForm) => {
      return await apiPost<AuthResponse>("/auth/login", data);
    },
    onSuccess: async (data) => {
      login(data);
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
      console.error(error);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationKey: ["changePassword"],
    mutationFn: async (data: SettingsPasswordForm) => {
      const { confirmPassword, ...rest } = data;
      return await apiPatch<AuthResponse>("/auth/change-password", rest);
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      useAuthStore.getState().logout();
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
      console.error(error);
    },
  });
}
