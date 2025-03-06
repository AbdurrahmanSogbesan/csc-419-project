import SearchBar from "@/components/SearchBar";
import TabsFilter from "@/components/TabsFilter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetUsers } from "@/hooks/users";
import { format } from "date-fns";
import { useState } from "react";

const userHeaders = ["Name", "Email", "Role", "Created At"];

const dummyTabs: Tab[] = [
  { label: "All", count: 15, value: "all" },
  { label: "Active", count: 5, value: "active" },
  { label: "Suspended", count: 10, value: "suspended" },
];

export default function UsersPage() {
  const [selectedTab, setSelectedTab] = useState(dummyTabs[0].value);

  const { data: userData } = useGetUsers({
    page: 1,
    limit: 10,
  });

  console.log(userData, "users");

  return (
    <div className="flex flex-col gap-6">
      <SearchBar className="md:max-w-[506px]" />

      <div className="flex flex-col gap-4">
        <TabsFilter
          tabs={dummyTabs}
          selectedTab={selectedTab}
          onTabClick={setSelectedTab}
        />
      </div>

      <Table className="border">
        <TableHeader>
          <TableRow>
            {userHeaders.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {userData?.users
            .filter((user) =>
              selectedTab === "all"
                ? user
                : user.role.toLowerCase() === selectedTab,
            )
            .map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{format(user.createdAt, "d MMM yyyy")}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
