import { cn } from "@/lib/utils";

export default function TabsFilter({
  selectedTab,
  onTabClick,
  tabs,
}: {
  selectedTab: string;
  onTabClick: (tab: string) => void;
  tabs: Tab[];
}) {
  return (
    <div className="no-scrollbar flex w-full items-center overflow-x-auto rounded-[6px] bg-slate-100 p-1 sm:w-fit">
      {tabs.map((tab) => (
        <TabItem
          key={tab.value}
          tab={tab}
          isActive={selectedTab === tab.value}
          onClick={() => onTabClick(tab.value)}
        />
      ))}
    </div>
  );
}

function TabItem({
  tab,
  isActive,
  onClick,
}: {
  tab: Tab;
  isActive: boolean;
  onClick: VoidFunction;
}) {
  return (
    <div
      className={cn(
        "flex cursor-pointer items-center gap-1 whitespace-nowrap px-3 py-[6px] text-sm font-medium text-slate-700 transition-all duration-300",
        isActive && "rounded-[3px] bg-base-white text-slate-900",
      )}
      onClick={onClick}
    >
      {tab.label}
      {tab.count && <span>{tab.count}</span>}
    </div>
  );
}
