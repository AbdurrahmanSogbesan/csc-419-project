import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

export default function SearchBar({
  className,
  placeholder = "Search by title, author, category...",
  searchValue,
  onSearchValueChange,
  onEnterPressed,
}: {
  className?: string;
  placeholder?: string;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
  onEnterPressed?: VoidFunction;
}) {
  return (
    <div
      className={cn(
        "relative w-full max-w-xs md:max-w-[min(49%,506px)]",
        className,
      )}
    >
      <Input
        className="pl-8 pr-7 ring-offset-0 focus-visible:ring-transparent focus-visible:ring-offset-0 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        type="search"
        value={searchValue}
        placeholder={placeholder}
        onChange={(e) => onSearchValueChange?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onEnterPressed?.();
          }
        }}
      />
      <Search className="absolute left-2 top-1/2 size-[18px] -translate-y-1/2 text-gray-500" />

      {searchValue && (
        <X
          className="absolute right-2 top-1/2 size-[16px] -translate-y-1/2 cursor-pointer text-gray-500"
          onClick={() => onSearchValueChange?.("")}
        />
      )}
    </div>
  );
}
