import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const pathname = useLocation().pathname;
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarGroup className="mt-7">
      <SidebarMenu>
        {items.map((item) => (
          <SidebarGroupContent key={item.title}>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={pathname === item.url}
                tooltip={item.title}
                asChild
                className="text-base"
              >
                <Link
                  to={item.url}
                  onClick={() => {
                    if (isMobile) setOpenMobile(false);
                  }}
                >
                  {item.icon && <item.icon />}
                  {item.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroupContent>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
