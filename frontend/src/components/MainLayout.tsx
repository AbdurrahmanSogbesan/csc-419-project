import { ReactNode, useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import Cookies from "js-cookie";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";

import { AppSidebar } from "./AppSidebar";
import { ListFilter, MoveLeft, PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import SearchBar from "./SearchBar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl } from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "./ui/select";
import { Input } from "./ui/input";
import { DatePicker } from "./ui/date-picker";
import { format } from "date-fns";
import { toast } from "sonner";
import { getDirtyValues } from "@/lib/utils";

const filterSchema = z.object({
  availabilityStatus: z.string().optional(),
  author: z.string().optional(),
  publishedYearStart: z.string().optional(),
  publishedYearEnd: z.string().optional(),
  borrowStartDate: z.date().optional(),
  borrowEndDate: z.date().optional(),
});

type FilterForm = z.infer<typeof filterSchema>;

const availabilityStatusOptions = [
  { label: "Available", value: "available" },
  { label: "Unavailable", value: "unavailable" },
];

const DEFAULT_FORM_VALUES = {
  availabilityStatus: "",
  author: "",
  publishedYearStart: "",
  publishedYearEnd: "",
  borrowStartDate: undefined,
  borrowEndDate: undefined,
} as const;

const DATE_FIELDS = ["borrowStartDate", "borrowEndDate"] as const;

export default function MainLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || "",
  );

  const defaultOpen = Cookies.get("sidebar_state") === "true";

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const isAdminRoute = pathSegments.includes("admin");
  const isInnerPage = pathSegments.length > 1;

  const isAdminBooksPage = searchParams.get("tab") === "books";

  const isHistoryPage = location.pathname === "/history";

  const allowFilterPages = ["search", "saved-books", "history"];

  const form = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ...DEFAULT_FORM_VALUES,
      ...Object.fromEntries(
        Array.from(searchParams.entries()).map(([key, value]) => [
          key,
          DATE_FIELDS.includes(key as (typeof DATE_FIELDS)[number])
            ? new Date(value)
            : value,
        ]),
      ),
    },
  });

  // update search value state when search params change
  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  const formValues = form.getValues();
  const borrowStartDate = form.watch("borrowStartDate");
  const borrowEndDate = form.watch("borrowEndDate");

  const hasNoFilters = useMemo(
    () => Object.values(formValues).every((value) => !value),
    [formValues],
  );

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  function onSubmitFilters(values: FilterForm) {
    const dirtyValues = getDirtyValues(form.formState.dirtyFields, values);

    // Filter out empty/invalid values from dirty values
    const filteredValues = Object.fromEntries(
      Object.entries(dirtyValues).filter(([_, value]) => {
        if (value instanceof Date) {
          return !isNaN(value.getTime());
        }
        return Boolean(value);
      }),
    );

    const newParams = new URLSearchParams(searchParams);

    Object.keys(DEFAULT_FORM_VALUES).forEach((param) => {
      newParams.delete(param);
    });

    Object.entries(filteredValues).forEach(([key, value]) => {
      newParams.set(
        key,
        value instanceof Date ? format(value, "yyyy-MM-dd") : value,
      );
    });

    setSearchParams(newParams);
    setIsFilterOpen(false);
  }

  const handleSearch = (searchValue: string) => {
    if (!searchValue) {
      toast.error("Please enter a search value");
      return;
    }

    if (!allowFilterPages.some((p) => location.pathname.endsWith(p))) {
      navigate(`/dashboard/search?search=${searchValue}`);
    } else {
      // Preserve existing params while updating search param
      const newParams = new URLSearchParams(searchParams);
      newParams.set("search", searchValue);
      setSearchParams(newParams);
    }
  };

  const handleClearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("search");
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    form.reset(DEFAULT_FORM_VALUES);

    // Get current search params and remove only filter-related ones
    const newParams = new URLSearchParams(searchParams);
    Object.keys(DEFAULT_FORM_VALUES).forEach((param) => {
      newParams.delete(param);
    });

    setSearchParams(newParams);

    setIsFilterOpen(false);
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="gap-[6px] bg-gray-100 px-4 md:px-6">
        <header className="flex h-[60px] items-center justify-between gap-6">
          <div className="flex shrink-0 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {isInnerPage ? (
              <Button
                variant="ghost"
                className="p-0"
                // todo: needs testing w other inner pages
                onClick={() => navigate(`/${pathSegments[0]}`)}
              >
                <MoveLeft size={24} color="black" />
              </Button>
            ) : (
              <p className="text-xl font-semibold capitalize">
                {pathSegments.pop()?.replace(/-/g, " ")}
              </p>
            )}
          </div>

          {isAdminRoute ? (
            <Button
              onClick={() => {
                navigate(`/admin/${isAdminBooksPage ? "books" : "users"}/new`);
              }}
            >
              <PlusIcon /> Add New {isAdminBooksPage ? "Book" : "User"}
            </Button>
          ) : (
            <div className="flex w-full justify-end gap-2">
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="p-2 text-slate-700"
                    disabled={
                      !allowFilterPages.some((p) =>
                        location.pathname.endsWith(p),
                      )
                    }
                  >
                    <ListFilter size={24} />
                    <span className="hidden md:block">Filter</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 py-6 sm:w-[512px]">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitFilters)}>
                      <div className="flex flex-col gap-6 px-4 sm:px-6">
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-medium leading-[20px] text-slate-900">
                            Book info
                          </p>
                          <FormField
                            control={form.control}
                            name="availabilityStatus"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <FormControl>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select availability status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availabilityStatusOptions.map(
                                        (option) => (
                                          <SelectItem
                                            key={option.value}
                                            value={option.value}
                                          >
                                            {option.label}
                                          </SelectItem>
                                        ),
                                      )}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="author"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Author</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter author name"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <Separator className="mb-4 mt-6 h-[1px] text-slate-100" />
                      <div className="flex flex-col gap-2 px-4 sm:px-6">
                        <p className="text-xs font-medium leading-[20px] text-slate-900">
                          {isHistoryPage ? "Date borrowed" : "Year published"}
                        </p>

                        {isHistoryPage ? (
                          <div className="flex gap-6">
                            <DatePicker
                              control={form.control}
                              name="borrowStartDate"
                              label="From"
                              className="flex-1"
                              key={borrowStartDate?.toString()}
                              calendarProps={{
                                disabled: (date) => {
                                  return date > new Date();
                                },
                              }}
                            />
                            <DatePicker
                              control={form.control}
                              name="borrowEndDate"
                              label="To"
                              className="flex-1"
                              key={borrowEndDate?.toString()}
                              calendarProps={{
                                disabled: (date) => {
                                  return (
                                    date > new Date() ||
                                    date < (borrowStartDate as Date)
                                  );
                                },
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex gap-6">
                            <FormField
                              control={form.control}
                              name="publishedYearStart"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>From</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Year" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="publishedYearEnd"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>To</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Year" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex items-center gap-2 px-4 sm:px-6">
                        <Button
                          variant="outline"
                          className="flex-1"
                          disabled={hasNoFilters}
                          onClick={handleClearFilters}
                          type="button"
                        >
                          Clear filters
                        </Button>
                        <Button
                          className="flex-1"
                          disabled={hasNoFilters || !form.formState.isValid}
                          type="submit"
                        >
                          Apply
                        </Button>
                      </div>
                    </form>
                  </Form>
                </PopoverContent>
              </Popover>
              <SearchBar
                searchValue={searchValue}
                onSearchValueChange={setSearchValue}
                onEnterPressed={() => handleSearch(searchValue)}
                onClear={handleClearSearch}
              />
            </div>
          )}
        </header>
        <div className="flex flex-1 flex-col gap-4 pb-6">
          <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
