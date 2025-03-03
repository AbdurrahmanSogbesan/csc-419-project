import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema, LoginForm } from "../utils";
import { useLogin } from "@/hooks/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: login, isPending } = useLogin();

  function onSubmit(values: LoginForm) {
    login(values);
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-center text-2xl font-semibold text-base-black md:text-3xl">
        Login
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
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
            <p className="self-end text-sm">
              <Link
                to="/auth/forgot-password"
                className="underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !form.formState.isValid}
              loading={isPending}
            >
              Continue
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isPending}
              onClick={() => navigate("/auth/register")}
            >
              Sign Up
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
