import { ReactNode } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import Cookies from "js-cookie";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";

import { AppSidebar } from "./AppSidebar";
import { MoveLeft, PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import SearchBar from "./SearchBar";

export default function MainLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const defaultOpen = Cookies.get("sidebar_state") === "true";

  const pathSegments = location.pathname.split("/").filter(Boolean);

  const isAdminRoute = pathSegments.includes("admin");
  const [searchParams] = useSearchParams();

  const isBooksPage = searchParams.get("tab") === "books";

  const isInnerPage = pathSegments.length > 1;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="gap-[6px] bg-gray-100 px-4 md:px-6">
        <header className="flex h-[60px] items-center justify-between gap-6">
          <div className="flex shrink-0 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {isInnerPage ? (
              <Button
                variant="ghost"
                className="p-0"
                // todo: needs testing w other inner pages
                onClick={() => navigate(`/${pathSegments[0]}`)}
              >
                <MoveLeft size={24} color="black" />
              </Button>
            ) : (
              <p className="text-xl font-semibold capitalize">
                {pathSegments.pop()?.replace(/-/g, " ")}
              </p>
            )}
          </div>

          {isAdminRoute ? (
            <Button
              onClick={() => {
                navigate(`/admin/${isBooksPage ? "books" : "users"}/new`);
              }}
            >
              <PlusIcon /> Add New {isBooksPage ? "Book" : "User"}
            </Button>
          ) : (
            <SearchBar />
          )}
        </header>
        <div className="flex flex-1 flex-col gap-4 pb-6">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
