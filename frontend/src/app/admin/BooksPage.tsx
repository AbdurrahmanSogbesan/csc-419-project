import { DataTable } from "@/components/DataTable";

import { useDeleteBook, useGetBooks } from "@/hooks/books";
import { ColumnDef } from "@tanstack/react-table";

import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import CustomTooltip from "@/components/tooltip";
import { Link } from "react-router";
import { ConfirmModal } from "@/components/confirm-modal";
import SearchBar from "@/components/SearchBar";
import { useDebounce } from "@/hooks/use-debounce";

const PAGE_SIZE = 12;

export default function BooksPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [bookModalData, setBookModalData] = useState<{
    isOpen: boolean;
    data: Book | null;
  }>({
    isOpen: false,
    data: null,
  });

  const debouncedSearch = useDebounce(search, 500);

  const { data: books, isLoading } = useGetBooks({
    pageSize: 1000,
    search: debouncedSearch,
  });

  const closeModal = () => {
    setBookModalData(() => ({
      isOpen: false,
      data: null,
    }));
  };

  const { mutate: deleteBook, isPending } = useDeleteBook(() => closeModal());

  const colDefs = useMemo<ColumnDef<Book>[]>(
    () => [
      {
        header: "Title",
        accessorKey: "title",
        cell: ({ row }) => (
          <CustomTooltip
            trigger={
              <p className="max-w-[200px] truncate">{row.original.title}</p>
            }
            content={row.original.title}
          />
        ),
      },
      {
        header: "Author",
        accessorKey: "author",
        cell: ({ row }) => (
          <CustomTooltip
            trigger={
              <p className="max-w-[200px] truncate">{row.original.author}</p>
            }
            content={row.original.author}
          />
        ),
      },
      {
        header: "Copies Borrowed",
        accessorKey: "borrowCount",
      },
      {
        header: "Copies Available",
        accessorKey: "copiesAvailable",
      },
      {
        header: "Categories",
        accessorKey: "category",
        cell: ({ row }) => {
          const categories = Array.isArray(row.original.category)
            ? row.original.category
            : [row.original.category];
          return categories.length > 0 ? (
            <CustomTooltip
              trigger={
                <p className="max-w-[200px] truncate capitalize">
                  {categories.join(", ")}
                </p>
              }
              content={categories.join(", ")}
            />
          ) : (
            "N/A"
          );
        },
      },

      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 ring-offset-transparent hover:bg-transparent focus-visible:ring-0 focus-visible:ring-transparent"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              <Link to={`/admin/books/${row.original.id}`}>
                <DropdownMenuItem>Edit Book</DropdownMenuItem>
              </Link>

              <DropdownMenuItem
                className="text-red-500 focus:bg-red-500 focus:text-white"
                onClick={() =>
                  setBookModalData({
                    isOpen: true,
                    data: row.original,
                  })
                }
              >
                Delete Book
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <SearchBar
        className="md:max-w-[506px]"
        searchValue={search}
        onSearchValueChange={setSearch}
        onClear={() => setSearch("")}
      />
      <DataTable
        columns={colDefs}
        data={books?.data ?? []}
        isLoading={isLoading}
        paginationProps={{
          currentPage: page,
          itemsPerPage: PAGE_SIZE,
          pagesCount: Math.ceil((books?.pagination?.total ?? 0) / PAGE_SIZE),
          onNextPageClick: () => setPage(page + 1),
          onPrevPageClick: () => setPage(page - 1),
        }}
      />

      <ConfirmModal
        title={`Delete Book - ${bookModalData?.data?.title}?`}
        description="This action cannot be undone. This will permanently delete the book and remove it from our servers."
        onConfirm={() => {
          deleteBook(bookModalData?.data?.id ?? "");
        }}
        isLoading={isPending}
        open={bookModalData?.isOpen}
        onOpenChange={() =>
          setBookModalData((prev) => ({
            isOpen: !prev?.isOpen,
            data: prev?.isOpen ? null : prev?.data,
          }))
        }
      />
    </div>
  );
}
