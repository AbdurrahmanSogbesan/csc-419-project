import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { KeyRound, User } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { useUpdateUser } from "@/hooks/users";
import { getDirtyValues } from "@/lib/utils";
import {
  SettingsPasswordForm,
  passwordSchema,
  SettingsProfileForm,
  profileSchema,
} from "./utils";
import { useChangePassword } from "@/hooks/auth";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  const profileForm = useForm<SettingsProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
    },
  });

  const {
    formState: {
      isValid: isValidProfile,
      isDirty: isDirtyProfile,
      dirtyFields,
    },
    reset: resetProfile,
  } = profileForm;

  const passwordForm = useForm<SettingsPasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const { mutate: updateUser, isPending: updatingUser } = useUpdateUser(
    user?.id as string,
    () => {
      resetProfile({}, { keepValues: true });
    },
  );

  const {
    formState: { isValid: isValidPassword },
  } = passwordForm;

  function onProfileSubmit(values: SettingsProfileForm) {
    const reqBody = getDirtyValues(
      dirtyFields,
      values,
    ) as Partial<SettingsProfileForm>;

    updateUser(reqBody);
  }

  const { mutate: changePassword, isPending: changingPassword } =
    useChangePassword();

  function onPasswordSubmit(values: SettingsPasswordForm) {
    changePassword(values);
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="mt-2 text-sm text-gray-600 md:text-base">
        Manage your account settings and preferences.
      </p>

      <div className="mx-auto w-full max-w-2xl">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl bg-white p-6 shadow-books-card">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-gray-100 p-2">
                <User className="size-5 text-gray-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Information
              </h2>
            </div>

            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-4"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
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

                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Enter your phone number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  loading={updatingUser}
                  disabled={!isValidProfile || !isDirtyProfile || updatingUser}
                  className="w-full md:w-[200px]"
                >
                  Update Profile
                </Button>
              </form>
            </Form>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-books-card">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-gray-100 p-2">
                <KeyRound className="size-5 text-gray-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Change Password
              </h2>
            </div>

            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <div className="grid gap-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter current password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter new password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm new password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!isValidPassword || changingPassword}
                  loading={changingPassword}
                  className="w-full md:w-[200px]"
                >
                  Change Password
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
