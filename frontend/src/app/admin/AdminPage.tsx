import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router";
import { useRef, useEffect, useState } from "react";
import UsersPage from "./UsersPage";

const tabsMap = {
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

export default function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabName) ?? "users";
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabs = Object.entries(tabsMap);

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;
      setIndicatorStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeTab]);

  useEffect(() => {
    // initialize the tab
    setSearchParams({ tab: activeTab });
  }, []);

  return (
    <div className="flex min-h-full flex-col gap-6">
      <p className="text-sm text-gray-600 md:text-base">
        Manage users and books in one place.
      </p>

      <Tabs defaultValue={activeTab} className="flex flex-1 flex-col">
        <div className="relative w-full">
          <TabsList className="h-10 w-full justify-start gap-8 rounded-none bg-transparent px-0">
            {tabs.map(([key]) => (
              <TabsTrigger
                key={key}
                value={key}
                ref={(el) => {
                  if (el) {
                    tabRefs.current[key] = el;
                  }
                }}
                onClick={() => setSearchParams({ tab: key })}
                className="relative h-8 rounded-none border-transparent bg-transparent px-0 text-xl font-normal capitalize text-gray-500 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                {key}
              </TabsTrigger>
            ))}
          </TabsList>
          <div
            className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-in-out"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
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
