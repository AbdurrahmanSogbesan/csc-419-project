import { ReactNode, useEffect } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router";
import MainLayout from "./MainLayout";
import { AuthRoutes } from "@/app/auth";
import DashboardPage, { BookDetailsPage } from "@/app/dashboard";
import { useAuthStore } from "@/lib/stores/auth";
import AdminLayout from "@/app/admin";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import SavedBooks from "@/app/saved-books";

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
      <Route path="books" element={<div>Books</div>} />
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

function MainRoutes() {
  const user = useAuthStore((s) => s.user);

  const isAdmin = user?.role === "ADMIN";

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate replace to="dashboard" />} />
        <Route index path="dashboard/*" element={<DashboardRoutes />} />
        <Route path="saved-books/*" element={<SavedBooksRoutes />} />
        <Route path="notifications" element={<div>Notifications</div>} />
        <Route path="history" element={<div>History</div>} />
        <Route path="settings" element={<div>Settings</div>} />
        {isAdmin && <Route path="admin" element={<AdminLayout />} />}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="auth/*" element={<AuthRoutes />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <MainRoutes />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="text-xl text-muted-foreground">Oops! Page not found</p>
      <Separator className="my-4 h-1 w-24 rounded bg-primary" />
      <p className="mb-6 text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild size="lg">
        <Link to="/dashboard">Go Home</Link>
      </Button>
    </div>
  );
}
