import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark } from "lucide-react";
import SavedIcon from "@/assets/icons/saved.svg";
import PlaceholderImage from "@/assets/images/placeholder-image.png";

export default function BookCard({
  book,
  onReserve,
  onSave,
  onCardClick,
  className,
  canSave,
  disabled,
  hideBookInfo,
}: {
  book: Book & { isSaved?: boolean; isReserved?: boolean };
  onReserve?: VoidFunction;
  onSave?: VoidFunction;
  onCardClick?: VoidFunction;
  className?: string;
  canSave?: boolean;
  disabled?: boolean;
  hideBookInfo?: boolean;
}) {
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div
        className={cn(
          "relative",
          onCardClick && "cursor-pointer",
          disabled && "cursor-not-allowed",
        )}
        onClick={onCardClick}
      >
        <div className="h-[320px] w-full overflow-hidden rounded-[8px]">
          <img
            src={book.imageUrl || PlaceholderImage}
            className="h-full w-full object-cover transition-all duration-300 hover:scale-110"
            alt={book.title}
          />
        </div>
        <div
          className={cn(
            "absolute right-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-black/50 to-gray-500/50 backdrop-blur-sm transition-all duration-300 hover:scale-110",
            // disabled state (e.g when saving/deleting)
            disabled && "cursor-not-allowed opacity-50 hover:scale-100",
          )}
          onClick={(e) => {
            e.stopPropagation();
            onSave?.();
          }}
        >
          {book.isSaved ? (
            <SavedIcon className="size-[14.77px] fill-base-white" />
          ) : (
            <Bookmark stroke="white" size={14.77} />
          )}
        </div>
      </div>
      {!hideBookInfo && (
        <div className="flex flex-col gap-[2px]">
          <p className="truncate text-sm font-semibold text-base-black">
            {book.title}
          </p>
          <p className="truncate text-xs font-medium text-gray-600">
            {book.author}
          </p>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Button
          onClick={onReserve}
          disabled={disabled || book.isReserved || book.copiesAvailable === 0}
        >
          {book.isReserved
            ? "Book Reserved"
            : book.copiesAvailable === 0
              ? "Out of Stock"
              : "Reserve Book"}
        </Button>
        {canSave && (
          <Button variant="outline" onClick={onSave} disabled={disabled}>
            {book.isSaved ? "Unsave" : "Save"} book
          </Button>
        )}
      </div>
    </div>
  );
}
