import { useAuthStore } from "@/lib/stores/auth";
import { useMemo } from "react";
import {
  SidebarMenuItem,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "./ui/sidebar";
import {
  BookCheck,
  Bot,
  Clock,
  Inbox,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import Logo from "@/assets/icons/logo.svg";
import { NavMain } from "./NavMain";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const { state, isMobile } = useSidebar();

  const isAdmin = user?.role === "ADMIN";

  const data = useMemo(() => {
    return {
      navMain: [
        ...(isAdmin
          ? [
              {
                title: "Admin",
                url: "/admin",
                icon: Bot,
              },
            ]
          : [
              {
                title: "Dashboard",
                url: "/dashboard",
                icon: LayoutDashboard,
              },
              {
                title: "Saved",
                url: "/saved-books",
                icon: BookCheck,
              },
              {
                title: "Inbox",
                url: "/notifications",
                icon: Inbox,
              },
              {
                title: "History",
                url: "/history",
                icon: Clock,
              },
            ]),

        {
          title: "Profile",
          url: "/settings",
          icon: User,
        },
      ],
    };
  }, [isAdmin]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader
        className={cn(
          state === "expanded" && !isMobile && "p-6 pb-0",
          isMobile && "p-6 pb-0",
        )}
      >
        <Logo
          className={cn(
            "cursor-pointer transition-all duration-200 ease-in-out",
            state === "collapsed" && !isMobile ? "size-6" : "size-10",
          )}
          onClick={() =>
            isAdmin ? navigate("/admin") : navigate("/dashboard")
          }
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem className="list-none">
          <SidebarMenuButton tooltip="Logout" onClick={logout}>
            <LogOut className="size-4" />
            Logout
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
