import { ReactNode, useMemo, useState } from "react";
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

const filterSchema = z.object({
  availabilityStatus: z.string().optional(),
  author: z.string().optional(),
  publishedYearStart: z.date().optional(),
  publishedYearEnd: z.date().optional(),
});

type FilterForm = z.infer<typeof filterSchema>;

const availabilityStatusOptions = [
  { label: "Available", value: "available" },
  { label: "Unavailable", value: "unavailable" },
];

export default function MainLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchValue, setSearchValue] = useState("");

  const defaultOpen = Cookies.get("sidebar_state") === "true";

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const isAdminRoute = pathSegments.includes("admin");
  const isInnerPage = pathSegments.length > 1;

  const isBooksPage = searchParams.get("tab") === "books";

  const allowFilterPages = ["search", "saved-books", "history"];

  const form = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      availabilityStatus: "",
      author: "",
    },
  });

  console.log("form.getValues", form.getValues());

  const hasNoFilters = useMemo(
    () => Object.values(form.getValues()).every((value) => !value),
    [form.getValues()],
  );

  function onSubmit(values: FilterForm) {
    console.log(values);
  }

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
                navigate(`/admin/${isBooksPage ? "books" : "users"}/new`);
              }}
            >
              <PlusIcon /> Add New {isBooksPage ? "Book" : "User"}
            </Button>
          ) : (
            <div className="flex w-full justify-end gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="p-2 text-slate-700"
                    disabled={allowFilterPages.every(
                      (p) => !location.pathname.endsWith(p),
                    )}
                  >
                    <ListFilter size={24} />
                    <span className="hidden md:block">Filter</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 py-6 sm:w-[512px]">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
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
                          Year published
                        </p>
                        <div className="flex gap-6">
                          <FormField
                            control={form.control}
                            name="publishedYearStart"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>From</FormLabel>
                                <DatePicker
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="publishedYearEnd"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>To</FormLabel>
                                <DatePicker
                                  value={field.value}
                                  onChange={field.onChange}
                                  calendarProps={{
                                    disabled: (date) => {
                                      return date > new Date();
                                    },
                                  }}
                                />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex items-center gap-2 px-4 sm:px-6">
                        <Button
                          variant="outline"
                          className="flex-1"
                          disabled={hasNoFilters}
                          onClick={() => form.reset()}
                          type="button"
                        >
                          Clear filters
                        </Button>
                        <Button
                          className="flex-1"
                          disabled={hasNoFilters}
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
              />
            </div>
          )}
        </header>
        <div className="flex flex-1 flex-col gap-4 pb-6">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
