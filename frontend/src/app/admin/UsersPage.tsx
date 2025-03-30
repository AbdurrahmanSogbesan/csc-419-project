import { DataTable } from "@/components/DataTable";
import SearchBar from "@/components/SearchBar";
import TabsFilter from "@/components/TabsFilter";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetUsers } from "@/hooks/users";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import {
  USER_STATUS,
  createUserStatusTabs,
  filterUsersByStatus,
} from "@/lib/utils";
import { StatusCell } from "@/components/StatusCell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { ConfirmModal } from "@/components/confirm-modal";

const PAGE_SIZE = 15;

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Tab["value"]>(
    USER_STATUS.ALL,
  );
  const [userModalData, setUserModalData] = useState<{
    isOpen: boolean;
    data: User | null;
    type: "delete" | "restrict" | "unrestrict" | null;
  }>({ isOpen: false, data: null, type: null });

  const debouncedSearch = useDebounce(search, 500);

  const { data: userData, isLoading } = useGetUsers({
    // :-((, needed cuz UI constraints
    pageSize: 1000,
    role: "MEMBER",
    search: debouncedSearch,
  });

  const userColumns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Borrowed Books",
        accessorKey: "borrowedBooks",
        cell: ({ row }) => {
          const activeLoans =
            row.original.borrowedBooks?.filter((book) => !book.returnDate)
              .length ?? 0;
          return activeLoans;
        },
      },
      {
        header: "Reserved Books",
        accessorKey: "reservations",
        cell: ({ row }) => {
          const activeReservations =
            row.original.reservations?.filter(
              (res) => res.status === "RESERVED",
            ).length ?? 0;
          return activeReservations;
        },
      },
      {
        header: "Joined",
        accessorKey: "createdAt",
        cell: ({ row }) =>
          format(new Date(row.original.createdAt), "MMM d, yyyy"),
      },
      {
        header: "Status",
        accessorKey: "restrictedUntil",
        cell: ({ row }) => (
          <StatusCell
            status={row.original.restrictedUntil ? "restricted" : "active"}
          />
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const isRestricted = !!row.original.restrictedUntil;
          return (
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
                <DropdownMenuItem disabled={!isRestricted}>
                  Unrestrict User
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isRestricted}
                  onClick={() => {
                    setUserModalData({
                      isOpen: true,
                      data: row.original,
                      type: "restrict",
                    });
                  }}
                >
                  Restrict User
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 focus:bg-red-500 focus:text-white"
                  onClick={() =>
                    setUserModalData({
                      isOpen: true,
                      data: row.original,
                      type: "delete",
                    })
                  }
                >
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  const tabs = useMemo(
    () => createUserStatusTabs(userData?.data ?? []),
    [userData?.data],
  );

  const filteredUsers = useMemo(
    () => filterUsersByStatus(userData?.data ?? [], selectedStatus),
    [userData?.data, selectedStatus],
  );

  // Reset pagination when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col gap-6">
      <SearchBar
        className="md:max-w-[506px]"
        placeholder="Search by name or email"
        searchValue={search}
        onSearchValueChange={setSearch}
        onClear={() => setSearch("")}
      />

      <TabsFilter
        tabs={tabs}
        selectedTab={selectedStatus}
        onTabClick={(tab) => {
          setPage(1);
          setSelectedStatus(tab);
        }}
      />

      <DataTable
        columns={userColumns}
        data={filteredUsers}
        isLoading={isLoading}
        paginationProps={{
          currentPage: page,
          itemsPerPage: PAGE_SIZE,
          pagesCount: Math.ceil((userData?.pagination?.total ?? 0) / PAGE_SIZE),
          onNextPageClick: () => setPage(page + 1),
          onPrevPageClick: () => setPage(page - 1),
        }}
      />

      <ConfirmModal
        title={`${userModalData?.type === "delete" ? "Delete" : userModalData?.type === "restrict" ? "Restrict" : "Unrestrict"} User - ${userModalData?.data?.name}?`}
        description={
          userModalData?.type === "delete"
            ? "This action cannot be undone. This will permanently delete the user and remove their data from our servers."
            : userModalData?.type === "restrict"
              ? "This action cannot be undone. This will restrict the user from borrowing books."
              : "This action cannot be undone. This will allow the user to borrow books again."
        }
        onConfirm={() => {}}
        open={userModalData?.isOpen}
        onOpenChange={() =>
          setUserModalData((prev) => ({
            isOpen: !prev?.isOpen,
            data: prev?.isOpen ? null : prev?.data,
            type: prev?.type ? null : prev?.type,
          }))
        }
      />
    </div>
  );
}
