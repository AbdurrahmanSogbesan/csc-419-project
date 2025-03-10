import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router";
import { useRef } from "react";
import UsersPage from "./UsersPage";
import AdminDashboard from "./AdminDashboard";

const tabsMap = {
  dashboard: {
    title: "Dashboard",
    element: <AdminDashboard />,
  },
  users: {
    title: "Users Management",
    element: <UsersPage />,
  },
  books: {
    title: "Books Management",
    element: <div>Books</div>,
  },
};

type TabName = keyof typeof tabsMap;

export default function AdminLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabName) ?? "dashboard";

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabs = Object.entries(tabsMap);

  return (
    <div className="flex min-h-full flex-col gap-6">
      <p className="text-sm text-gray-600 md:text-base">
        Manage users and books in one place.
      </p>

      <Tabs value={activeTab} className="flex flex-1 flex-col">
        <div className="relative w-full">
          <TabsList className="no-scrollbar h-10 w-full justify-start gap-8 overflow-x-auto rounded-none bg-transparent px-0">
            {tabs.map(([key, value]) => (
              <TabsTrigger
                key={key}
                value={key}
                ref={(el) => {
                  if (el) {
                    tabRefs.current[key] = el;
                  }
                }}
                onClick={() => setSearchParams({ tab: key })}
                className="relative h-8 rounded-none border-transparent bg-transparent px-0 text-xl font-normal capitalize text-gray-500 hover:text-slate-700 data-[state=active]:border-b-2 data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:shadow-none"
              >
                {value.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {tabs.map(([key, value]) => (
          <TabsContent
            key={key}
            value={key}
            className="flex-1 overflow-auto px-0 pt-6 data-[state=active]:border-none"
          >
            {value.element}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
