import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Form } from "@/components/ui/form";
import {
  ForgotPasswordForm,
  forgotPasswordSchema,
  ResetPasswordForm,
  resetPasswordSchema,
} from "../utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MoveLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [inviteSent, setInviteSent] = useState(false);

  const forgotPasswordForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetPasswordForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmitForgotPasswordForm(values: ForgotPasswordForm) {
    console.log("values", values);
    // simulate loading then set inviteSent to true, also show toast
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setInviteSent(true);
    forgotPasswordForm.reset();
    toast.success("Reset link sent to your email");
  }

  async function onSubmitResetPasswordForm(values: ResetPasswordForm) {
    console.log("values", values);
    // simulate loading, then show toast and then navigate to login
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Password reset successfully");
    navigate("/auth/login");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-center text-2xl font-semibold text-base-black md:text-3xl">
          Forgot Password
        </p>
        <p className="text-center text-sm text-slate-400">
          A reset link would be sent to your mail.
        </p>
      </div>
      {!inviteSent ? (
        <Form {...forgotPasswordForm}>
          <form
            onSubmit={forgotPasswordForm.handleSubmit(
              onSubmitForgotPasswordForm,
            )}
            className="space-y-4 md:space-y-6"
          >
            <FormField
              control={forgotPasswordForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={
                  !forgotPasswordForm.formState.isValid ||
                  forgotPasswordForm.formState.isSubmitting
                }
                loading={forgotPasswordForm.formState.isSubmitting}
              >
                <Mail className="size-4" />
                Reset password
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={forgotPasswordForm.formState.isSubmitting}
                onClick={() => navigate("/auth/login")}
              >
                Login
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <Form {...resetPasswordForm}>
          <form
            onSubmit={resetPasswordForm.handleSubmit(onSubmitResetPasswordForm)}
            className="space-y-4 md:space-y-6"
          >
            <div className="flex w-full flex-col gap-6 md:flex-row">
              <FormField
                control={resetPasswordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      *Not more than 12 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={resetPasswordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      *Must be the same as the password
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={
                  !resetPasswordForm.formState.isValid ||
                  resetPasswordForm.formState.isSubmitting
                }
                loading={resetPasswordForm.formState.isSubmitting}
              >
                <Mail className="size-4" />
                Reset password
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={resetPasswordForm.formState.isSubmitting}
                onClick={() => setInviteSent(false)}
              >
                <MoveLeft className="size-4" />
                Back
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
