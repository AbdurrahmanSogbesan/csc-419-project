import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useGetNotifications, useMarkNotificationAsRead } from "@/hooks/users";
import { cn } from "@/lib/utils";
import {
  getNotificationColor,
  getNotificationIcon,
  getNotificationStatus,
  getTimeDisplay,
} from "./utils";
import { Book, X } from "lucide-react";
import NoResults from "@/components/NoResults";

export default function NotificationsPage() {
  const { data, isLoading } = useGetNotifications({
    page: 1,
    // todo: change later after adding infinite scroll
    pageSize: 1000,
    includeRead: true,
  });

  const { mutate: markNotificationAsRead, isPending: isMarkingAsRead } =
    useMarkNotificationAsRead();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <p className="mt-2 text-sm text-gray-600 md:text-base">
        View and manage your notifications about books, reservations, and
        important updates.
      </p>

      {isLoading ? (
        <div className="mx-auto w-full max-w-2xl space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <NotificationSkeleton key={idx} />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="mx-auto w-full max-w-2xl space-y-4">
          {data.data.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              disableActions={isMarkingAsRead}
              onMarkAsRead={(id) => markNotificationAsRead(id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-1">
          <NoResults
            title="No notifications found"
            description="You don't have any notifications yet."
          />
        </div>
      )}
    </div>
  );
}

const NotificationCard = ({
  notification,
  onMarkAsRead,
  disableActions,
}: {
  notification: UserNotification;
  onMarkAsRead?: (id: number) => void;
  disableActions?: boolean;
}) => {
  const status = getNotificationStatus(notification);
  const timeDisplay = getTimeDisplay(notification.createdAt);

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-books-card",
        !notification.isRead
          ? "bg-white dark:bg-gray-900"
          : "bg-gray-50/50 dark:bg-gray-900/50",
      )}
    >
      <CardContent className="p-0">
        <div className="flex">
          <div
            className={cn(
              "hidden w-14 flex-shrink-0 items-center justify-center bg-gradient-to-br text-white md:flex",
              getNotificationColor(notification.type),
            )}
          >
            {getNotificationIcon(notification.type, "size-5")}
          </div>

          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4
                    className={cn(
                      "font-medium leading-tight",
                      !notification.isRead && "font-semibold",
                    )}
                  >
                    {notification.title}
                  </h4>
                  {status && (
                    <Badge
                      variant="default"
                      className={cn(
                        "h-5 px-2 text-[10px] uppercase",
                        status === "Just now" &&
                          "bg-green-500 hover:bg-green-600",
                        status === "New" && "bg-blue-500 hover:bg-blue-600",
                        status === "Unread" && "bg-gray-500 hover:bg-gray-600",
                      )}
                    >
                      {status}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {notification.message}
                </p>
              </div>

              {/* Right side actions */}
              <div className="flex-shrink-0">
                {!notification.isRead && onMarkAsRead && (
                  <button
                    onClick={() => onMarkAsRead(notification.id)}
                    disabled={disableActions}
                    className={cn(
                      "rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      disableActions && "opacity-50",
                    )}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Mark as read</span>
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
              <span>{timeDisplay}</span>

              {notification.book && (
                <div className="flex items-center gap-1">
                  <Book className="h-3 w-3" />
                  <span className="max-w-[150px] truncate">
                    {notification.book.title}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const NotificationSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex">
          {/* Left colored bar */}
          <div className="hidden w-14 flex-shrink-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 md:flex" />

          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="w-full">
                {/* Header with title and badge */}
                <div className="flex items-center gap-2">
                  <div className="h-5 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-5 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>

                {/* Message */}
                <div className="mt-1 h-5 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-1 h-5 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-2 flex items-center justify-between border-t border-dashed border-muted/50 pt-2">
              {/* Time */}
              <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

              {/* Book info */}
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
