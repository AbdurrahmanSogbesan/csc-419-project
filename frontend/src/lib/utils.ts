import Cookies from "js-cookie";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  parseISO,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TokenManagerConfig {
  accessTokenKey: string;
  cookieOptions?: Cookies.CookieAttributes;
}

const TOKEN_CONFIG: TokenManagerConfig = {
  accessTokenKey: "access_token",
  cookieOptions: {
    secure: import.meta.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: 1, // 1 day
  },
};

export const tokenManager = {
  clearToken: (): void => {
    Cookies.remove(TOKEN_CONFIG.accessTokenKey, TOKEN_CONFIG.cookieOptions);
  },

  setToken: (token: string): void => {
    if (!token) {
      throw new Error("Invalid token provided");
    }
    Cookies.set(TOKEN_CONFIG.accessTokenKey, token, TOKEN_CONFIG.cookieOptions);
  },

  getToken: () => Cookies.get(TOKEN_CONFIG.accessTokenKey),
};

export const convertArrayToString = (value: unknown) => {
  return Array.isArray(value) ? value.join(", ") : value;
};

export function processDataByMonth<T extends { createdAt: string }>(
  data: T[],
  // property to keep the count for each month
  dataKey: string,
  year: number = new Date().getFullYear(), // Optional year parameter, defaults to current year
) {
  // Create array of all months in the specified year
  const monthsInYear = eachMonthOfInterval({
    start: startOfYear(new Date(year, 0)),
    end: endOfYear(new Date(year, 0)),
  });

  // Initialize data structure with all months set to 0
  const baseData = monthsInYear.map((date) => ({
    month: format(date, "MMMM"),
    [dataKey]: 0,
  })) as MonthData[];

  // If no data, return the base structure
  if (!data.length) return baseData;

  // Only count items from the specified year
  data.forEach((item) => {
    const date = parseISO(item.createdAt);

    // Only process items from the specified year
    if (date.getFullYear() === year) {
      const monthName = format(date, "MMMM");
      const monthIndex = baseData.findIndex((item) => item.month === monthName);
      if (monthIndex !== -1) {
        baseData[monthIndex][dataKey] =
          (baseData[monthIndex][dataKey] as number) + 1;
      }
    }
  });

  return baseData;
}

export function getDirtyValues(
  dirtyFields: object | boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allValues: Record<string, any>,
): object {
  if (dirtyFields === true || Array.isArray(dirtyFields)) return allValues;
  return Object.fromEntries(
    Object.keys(dirtyFields as object).map((key) => [
      key,
      getDirtyValues(
        dirtyFields[key as keyof typeof dirtyFields],
        allValues[key],
      ),
    ]),
  );
}

export function buildQueryParams(searchParams: URLSearchParams) {
  return Object.fromEntries(searchParams.entries());
}

export function checkIfBookIsReserved(
  reservations: Reservation[],
  userId: string,
) {
  return reservations.some(
    (reservation) =>
      reservation.userId === userId && reservation.status === "RESERVED",
  );
}

export const historyTabLabels = [
  "All",
  "Borrowed",
  "Reserved",
  "Returned",
  "Cancelled",
] as const;

export function createHistoryTab(tabItem: string, items: Reservation[]) {
  return {
    label: tabItem,
    count:
      tabItem === "All"
        ? items.length
        : items.filter(
            (item) => item.status.toLowerCase() === tabItem.toLowerCase(),
          ).length,
    value: tabItem.toLowerCase(),
  };
}
