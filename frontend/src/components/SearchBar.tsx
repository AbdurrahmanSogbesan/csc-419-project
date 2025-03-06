import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

export default function SearchBar({
  className,
  placeholder = "Search by title, author, category...",
  onChange,
  onEnter,
}: {
  className?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onEnter?: () => void;
}) {
  return (
    <div
      className={cn(
        "relative w-full max-w-xs md:max-w-[min(49%,506px)]",
        className,
      )}
    >
      <Input
        className="pl-8 focus-visible:ring-0"
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onEnter?.();
          }
        }}
      />
      <Search className="absolute left-2 top-1/2 size-[18px] -translate-y-1/2 text-gray-500" />
    </div>
  );
}
