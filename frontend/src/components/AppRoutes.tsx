import { ReactNode, useEffect, useLayoutEffect } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router";
import MainLayout from "./MainLayout";
import { AuthRoutes } from "@/app/auth";
import DashboardPage, {
  BookDetailsPage,
  SearchBooksPage,
} from "@/app/dashboard";
import { useAuthStore } from "@/lib/stores/auth";
import AdminLayout, { EditBookPage } from "@/app/admin";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import SavedBooks from "@/app/saved-books";
import HistoryPage, { BookHistoryPage } from "@/app/history";
import SettingsPage from "@/app/settings";
import NotificationsPage from "@/app/notifications";

// Our auth middleware component
function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isAuthenticated) {
    return <Navigate replace to="/auth" state={{ from: location }} />;
  }

  return children;
}

function DashboardRoutes() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="search" element={<SearchBooksPage />} />
      <Route path="books/:id" element={<BookDetailsPage />} />
      <Route path="*" element={<Navigate replace to="/dashboard" />} />
    </Routes>
  );
}

function SavedBooksRoutes() {
  return (
    <Routes>
      <Route index element={<SavedBooks />} />
      <Route path=":id" element={<BookDetailsPage />} />
      <Route path="*" element={<Navigate replace to="/saved-books" />} />
    </Routes>
  );
}

function HistoryRoutes() {
  return (
    <Routes>
      <Route index element={<HistoryPage />} />
      <Route path="/books/:id" element={<BookHistoryPage />} />
      <Route path="*" element={<Navigate replace to="/history" />} />
    </Routes>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<AdminLayout />} />
      <Route path="books/create" element={<EditBookPage />} />
      <Route path="books/:id" element={<EditBookPage />} />
      <Route path="*" element={<Navigate replace to="/admin" />} />
    </Routes>
  );
}

function MainRoutes() {
  const user = useAuthStore((s) => s.user);

  const isAdmin = user?.role === "ADMIN";

  return (
    <MainLayout>
      <Routes>
        <Route
          path="/"
          element={<Navigate replace to={isAdmin ? "admin" : "dashboard"} />}
        />
        {!isAdmin && (
          <>
            <Route index path="dashboard/*" element={<DashboardRoutes />} />
            <Route path="saved-books/*" element={<SavedBooksRoutes />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="history/*" element={<HistoryRoutes />} />
          </>
        )}
        <Route path="settings" element={<SettingsPage />} />
        {isAdmin && <Route path="admin/*" element={<AdminRoutes />} />}
        <Route path="*" element={<NotFound isAdmin={isAdmin} />} />
      </Routes>
    </MainLayout>
  );
}

const Wrapper = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  useLayoutEffect(() => {
    // Scroll to the top of the page when the route changes
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="auth/*" element={<AuthRoutes />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <Wrapper>
              <MainRoutes />
            </Wrapper>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

function NotFound({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="text-xl text-muted-foreground">Oops! Page not found</p>
      <Separator className="my-4 h-1 w-24 rounded bg-primary" />
      <p className="mb-6 text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild size="lg">
        <Link to={isAdmin ? "/admin" : "/dashboard"}>Go Home</Link>
      </Button>
    </div>
  );
}
