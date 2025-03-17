import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: boolean;
  paginationProps?: {
    itemsPerPage: number;
    currentPage: number;
    onNextPageClick: VoidFunction;
    onPrevPageClick: VoidFunction;
    pagesCount: number;
  };
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  data,
  columns,
  pagination,
  paginationProps,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: paginationProps?.itemsPerPage || 8,
      },
    },
    defaultColumn: {
      minSize: 0,
      size: Number.MAX_SAFE_INTEGER,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="flex h-full w-full flex-col">
      {isLoading ? (
        <div className="flex h-60 items-center justify-center border border-slate-200">
          <RefreshCw className="animate-spin" />
        </div>
      ) : (
        <div>
          <Table className="border border-slate-200">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        style={{
                          width:
                            header.getSize() === Number.MAX_SAFE_INTEGER
                              ? "auto"
                              : header.getSize(),
                        }}
                        className={cn(header.index === 0 && "text-left")}
                      >
                        <p>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </p>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          width:
                            cell.column.getSize() === Number.MAX_SAFE_INTEGER
                              ? "auto"
                              : cell.column.getSize(),
                        }}
                        className={cn(
                          cell.column.getIndex() === 0 && "pl-6 text-left",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-28 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {(pagination || paginationProps) && (
        <div className="flex items-center justify-between border border-t-0 border-slate-200 pl-4">
          <p className="text-sm">
            Page{" "}
            {paginationProps?.currentPage ||
              table.getState().pagination.pageIndex + 1}{" "}
            of {paginationProps?.pagesCount || table.getPageCount()}
          </p>

          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-none border-r-0 border-t-0 border-slate-200 bg-transparent px-[14px] py-2 hover:bg-gray-200/50"
              onClick={() =>
                paginationProps?.onPrevPageClick() || table.previousPage()
              }
              disabled={
                paginationProps?.currentPage
                  ? paginationProps?.currentPage === 1
                  : !table.getCanPreviousPage()
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-none border-r-0 border-t-0 border-slate-200 bg-transparent px-[14px] py-2 hover:bg-gray-200/50"
              onClick={() =>
                paginationProps?.onNextPageClick() || table.nextPage()
              }
              disabled={
                paginationProps?.currentPage
                  ? paginationProps?.pagesCount - paginationProps?.currentPage <
                    1
                  : !table.getCanNextPage()
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
