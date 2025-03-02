import { Outlet } from "react-router";
import Logo from "@/assets/icons/logo.svg";

// temporary auth UI
export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen bg-background">
      <Logo className="absolute left-6 top-6" />
      <div className="flex w-full flex-col items-center justify-center gap-[63px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-base-black text-[30px] font-bold leading-[36px]">
            Welcome to the Computer Science Library
          </p>
          <p className="text-base text-slate-400">Continue as: </p>
        </div>

        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
