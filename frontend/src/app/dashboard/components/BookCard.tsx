import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark, BookmarkCheck } from "lucide-react";

export default function BookCard({
  book,
  onReserve,
  onSave,
}: {
  book: Book & { isSaved: boolean };
  onReserve?: VoidFunction;
  onSave?: VoidFunction;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="relative">
        <img
          src={book.imageUrl || "https://placehold.co/100x100"}
          className="h-[320px] w-full rounded-[8px] object-cover"
          alt="Book"
        />
        <div
          className={cn(
            "absolute right-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-black/50 to-gray-500/50 backdrop-blur-sm transition-all duration-300 hover:scale-110",
            // disabled state (e.g when saving/deleting)
            !onSave && "cursor-not-allowed opacity-50 hover:scale-100",
          )}
          onClick={onSave}
        >
          {book.isSaved ? (
            <BookmarkCheck stroke="white" size={14.77} />
          ) : (
            <Bookmark stroke="white" size={14.77} />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-[2px]">
        <p className="truncate text-sm font-semibold text-base-black">
          {book.title}
        </p>
        <p className="truncate text-xs font-medium text-gray-600">
          {book.author}
        </p>
      </div>
      <Button onClick={onReserve}>Reserve Book</Button>
    </div>
  );
}
