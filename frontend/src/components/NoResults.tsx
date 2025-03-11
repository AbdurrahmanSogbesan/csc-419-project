import { CircleAlert } from "lucide-react";

export default function NoResults({
  title = "No results",
  description = "No books found. Please try again.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="shadow-books-card m-auto flex h-[360px] w-full flex-col items-center justify-center gap-6 rounded-[16px] bg-gray-50 p-4">
      <CircleAlert size={48} color="black" />

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-3xl font-medium text-base-black">{title}</p>
        <p className="text-base font-medium text-gray-600">{description}</p>
      </div>
    </div>
  );
}
