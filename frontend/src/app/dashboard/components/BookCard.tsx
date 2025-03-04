import SaveIcon from "@/assets/icons/save.svg";
import { Button } from "@/components/ui/button";

export default function BookCard({
  onReserve,
  book,
}: {
  onReserve?: VoidFunction;
  onSave?: VoidFunction;
  book: Book;
}) {
  return (
    <div className="flex w-full flex-col gap-2 sm:w-fit">
      <div className="relative">
        <img
          src={book.image}
          className="h-[320px] w-full rounded-[8px] object-cover"
          alt="Book"
        />
        <SaveIcon className="absolute right-3 top-3 size-8 cursor-pointer" />
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
