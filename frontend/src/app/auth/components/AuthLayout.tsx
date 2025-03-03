import { Outlet } from "react-router";
import Logo from "@/assets/icons/logo.svg";

export default function AuthLayout() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden bg-[url('/auth.png')] bg-cover bg-center bg-no-repeat lg:flex lg:flex-col lg:items-center lg:justify-center">
        <p className="relative z-10 max-w-2xl px-6 text-center text-[48px] font-extrabold leading-[48px] tracking-tight text-base-white">
          Welcome to the Computer Science Library
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 px-6 py-8 md:p-0">
        <Logo className="size-10" />

        <div className="w-full max-w-[unset] sm:max-w-[560px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
