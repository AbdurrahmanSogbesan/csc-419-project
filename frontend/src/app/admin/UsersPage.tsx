import { DataTable } from "@/components/DataTable";
import SearchBar from "@/components/SearchBar";
import TabsFilter from "@/components/TabsFilter";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetUsers, useRestrictUser, useUnrestrictUser } from "@/hooks/users";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";

const restrcitionSchema = z.object({
  restrictedUntil: z.date().optional(),
});

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
  }>({ isOpen: false, data: null });

  const [restrictUserModalData, setRestrictUserModalData] = useState<{
    isOpen: boolean;
    data: User | null;
    type: "restrict" | "unrestrict" | null;
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
            status={
              row.original.restrictedUntil || row.original.isRestricted
                ? "restricted"
                : "active"
            }
          />
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const isRestricted =
            !!row.original.restrictedUntil || row.original.isRestricted;
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
                <DropdownMenuItem
                  disabled={!isRestricted}
                  onClick={() => {
                    setRestrictUserModalData({
                      isOpen: true,
                      data: row.original,
                      type: "unrestrict",
                    });
                  }}
                >
                  Unrestrict User
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isRestricted}
                  onClick={() => {
                    setRestrictUserModalData({
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

  const { mutate: restrictUser, isPending: isRestricting } = useRestrictUser(
    () => closeRestrictUserModal(),
  );

  const { mutate: unrestrictUser, isPending: isUnrestricting } =
    useUnrestrictUser(() => closeRestrictUserModal());

  const togglingRestriction = isRestricting || isUnrestricting;

  const restrictionForm = useForm<z.infer<typeof restrcitionSchema>>({
    resolver: zodResolver(restrcitionSchema),
    defaultValues: {
      restrictedUntil: undefined,
    },
  });

  const closeRestrictUserModal = () => {
    setRestrictUserModalData((prev) => ({
      isOpen: !prev?.isOpen,
      data: prev?.isOpen ? null : prev?.data,
      type: prev?.isOpen ? null : prev?.type,
    }));
    restrictionForm.reset();
  };

  const tabs = useMemo(
    () => createUserStatusTabs(userData?.data ?? []),
    [userData?.data],
  );

  const filteredUsers = useMemo(
    () => filterUsersByStatus(userData?.data ?? [], selectedStatus),
    [userData?.data, selectedStatus],
  );

  function toggleUserRestriction(data: z.infer<typeof restrcitionSchema>) {
    if (restrictUserModalData?.type === "restrict") {
      restrictUser({
        userId: restrictUserModalData?.data?.id as string,
        restrictionDate: data.restrictedUntil?.toISOString(),
      });
    } else {
      unrestrictUser(restrictUserModalData?.data?.id as string);
    }
  }

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
        title={`Delete User - ${userModalData?.data?.name}?`}
        description={
          "This action cannot be undone. This will permanently delete the user and remove their data from our servers."
        }
        onConfirm={() => {}}
        open={userModalData?.isOpen}
        onOpenChange={() =>
          setUserModalData((prev) => ({
            isOpen: !prev?.isOpen,
            data: prev?.isOpen ? null : prev?.data,
          }))
        }
      />

      <AlertDialog
        open={restrictUserModalData?.isOpen}
        onOpenChange={() => {
          closeRestrictUserModal();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {restrictUserModalData?.type === "restrict"
                ? "Restrict User"
                : "Unrestrict User"}{" "}
              - {restrictUserModalData?.data?.name}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently restrict the user's account from reserving
              or borrowing books.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div>
            <Form {...restrictionForm}>
              <form className="space-y-4">
                {restrictUserModalData?.type === "restrict" && (
                  <DatePicker
                    control={restrictionForm.control}
                    name="restrictedUntil"
                    label="Restricted Until Date"
                    className="flex-1"
                    calendarProps={{
                      disabled: (date) => {
                        return date < new Date();
                      },
                    }}
                  />
                )}

                <AlertDialogFooter>
                  <AlertDialogCancel
                    type="button"
                    disabled={togglingRestriction}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    type="button"
                    disabled={togglingRestriction}
                    onClick={restrictionForm.handleSubmit(
                      toggleUserRestriction,
                    )}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </Form>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
