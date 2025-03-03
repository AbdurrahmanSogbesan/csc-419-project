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
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import Logo from "@/assets/icons/logo.svg";
import { NavMain } from "./NavMain";
import { cn } from "@/lib/utils";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const { state } = useSidebar();

  const data = useMemo(() => {
    return {
      navMain: [
        {
          title: "Dashboard",
          url: "/",
          icon: LayoutDashboard,
        },
        {
          title: "Inbox",
          // todo: url
          url: "/inbox",
          icon: Inbox,
        },
        {
          title: "History",
          // todo: url
          url: "/history",
          icon: Clock,
        },
        {
          title: "Saved",
          // todo: url
          url: "/saved",
          icon: BookCheck,
        },
        {
          title: "Support",
          // todo: url
          url: "/support",
          icon: HelpCircle,
        },
        {
          title: "Profile",
          // todo: url
          url: "/settings",
          icon: User,
        },
        ...(user?.role === "ADMIN"
          ? [
              {
                title: "Rate Lecturers",
                url: "/rate-lecturers",
                icon: Bot,
              },
            ]
          : []),
      ],
    };
  }, [user?.role]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className={state === "expanded" ? "p-6" : ""}>
        <Logo
          className={cn(
            "transition-all duration-200 ease-in-out",
            state === "collapsed" ? "size-6" : "size-10",
          )}
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
