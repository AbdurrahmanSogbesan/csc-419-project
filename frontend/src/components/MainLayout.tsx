import { ReactNode } from "react";
import { useLocation } from "react-router";
import Cookies from "js-cookie";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";

import { AppSidebar } from "./AppSidebar";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

export default function MainLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const defaultOpen = Cookies.get("sidebar_state") === "true";

  const pathSegments =
    location.pathname === "/"
      ? ["dashboard"]
      : location.pathname.split("/").filter(Boolean);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="gap-[6px] bg-gray-100 px-4 md:px-6">
        <header className="flex h-[60px] items-center justify-between gap-6">
          <div className="flex shrink-0 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <p className="text-xl font-semibold capitalize">
              {pathSegments.pop()?.replace(/-/g, " ")}
            </p>
          </div>

          <div className="relative w-full max-w-xs md:max-w-[min(49%,506px)]">
            <Input
              className="pl-8 focus-visible:ring-0"
              placeholder="Search by title, author, category..."
            />
            <Search className="absolute left-2 top-1/2 size-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 pb-6">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
