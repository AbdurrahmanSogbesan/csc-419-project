import { Outlet, useLocation } from "react-router";
import Logo from "@/assets/icons/logo.svg";

// temporary auth UI
export default function AuthLayout() {
  const location = useLocation();
  return (
    <div className="relative flex min-h-svh w-full flex-col bg-background px-6 py-10 md:items-center md:justify-center md:p-10">
      <Logo className="mb-6 size-10 md:absolute md:left-6 md:top-6 md:mb-0" />

      <div className="flex w-full flex-1 flex-col items-center justify-center gap-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-2xl font-bold leading-tight text-base-black md:text-[30px] md:leading-[36px]">
            Welcome to the Computer Science Library
          </p>
          {location.pathname.includes("login") ? (
            <p className="text-base text-slate-400">Login to your account</p>
          ) : (
            <p className="text-base text-slate-400">
              Register to create an account
            </p>
          )}
        </div>

        <div className="w-full max-w-[unset] sm:max-w-[276px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
