import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Bell,
  Book,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Info,
} from "lucide-react";

export const getNotificationIcon = (
  type: NotificationType,
  className?: string,
) => {
  switch (type) {
    case "RESERVATION_AVAILABLE":
      return <Calendar className={cn(className)} />;
    case "BOOK_DUE_SOON":
      return <Clock className={cn(className)} />;
    case "BOOK_OVERDUE":
      return <AlertCircle className={cn(className)} />;
    case "FINE_ISSUED":
      return <CreditCard className={cn(className)} />;
    case "FINE_PAYMENT_REMINDER":
      return <CreditCard className={cn(className)} />;
    case "SYSTEM_ANNOUNCEMENT":
      return <Info className={cn(className)} />;
    case "BOOK_PICKED_UP":
      return <BookOpen className={cn(className)} />;
    case "BOOK_RESERVED":
      return <Book className={cn(className)} />;
    case "BOOK_RETURNED":
      return <CheckCircle2 className={cn(className)} />;
    default:
      return <Bell className={cn(className)} />;
  }
};

export const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case "RESERVATION_AVAILABLE":
    case "BOOK_PICKED_UP":
    case "BOOK_RETURNED":
      return "from-emerald-500 to-teal-600";
    case "BOOK_DUE_SOON":
    case "FINE_PAYMENT_REMINDER":
    case "BOOK_RESERVED":
      return "from-amber-500 to-orange-600";
    case "BOOK_OVERDUE":
    case "FINE_ISSUED":
      return "from-rose-500 to-red-600";
    case "SYSTEM_ANNOUNCEMENT":
      return "from-blue-500 to-indigo-600";
    default:
      return "from-violet-500 to-purple-600";
  }
};

export const getTimeDisplay = (date: string) => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInHours =
    (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return formatDistanceToNow(notificationDate, { addSuffix: true });
  }
  return format(notificationDate, "MMM d, yyyy 'at' h:mm a");
};

export const getNotificationStatus = (notification: UserNotification) => {
  if (!notification.isRead) {
    const hoursAgo =
      (new Date().getTime() - new Date(notification.createdAt).getTime()) /
      (1000 * 60 * 60);
    if (hoursAgo < 1) return "Just now";
    if (hoursAgo < 24) return "New";
    return "Unread";
  }
  return null;
};
