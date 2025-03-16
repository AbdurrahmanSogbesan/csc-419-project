import { cn } from "@/lib/utils";

export type Status =
  | "returned"
  | "overdue"
  | "reserved"
  | "borrowed"
  | "cancelled";

const statusMap: Record<Status, { text: string; style: string }> = {
  reserved: {
    text: "Reserved",
    style: "bg-badge-blueBg border-badge-blueBorder",
  },
  borrowed: {
    text: "Borrowed",
    style: "bg-badge-amberBg border-badge-amberBorder",
  },
  overdue: { text: "Overdue", style: "bg-badge-redBg border-badge-redBorder" },
  returned: {
    text: "Returned",
    style: "bg-badge-greenBg border-badge-greenBorder",
  },
  cancelled: {
    text: "Cancelled",
    style: "bg-gray-200 border-gray-300",
  },
};

export const StatusCell = ({ status }: { status: Status }) => {
  return (
    <div
      className={cn(
        "w-fit rounded-full border px-4 py-[2px]",
        statusMap[status]?.style,
      )}
    >
      <p className="text-sm font-medium leading-[24px] text-[#212121]">
        {statusMap[status]?.text}
      </p>
    </div>
  );
};
