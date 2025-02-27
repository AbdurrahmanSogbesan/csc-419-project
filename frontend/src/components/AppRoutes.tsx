import { ReactNode, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import MainLayout from "./MainLayout";
import { AuthRoutes } from "@/app/auth";
import Home from "@/app/home";
import { useAuthStore } from "@/lib/stores/auth";

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

// todo: move to its own folder when pages are finalized
function CatalogRoutes() {
  return (
    <Routes>
      <Route index element={<div>Book Catalog</div>} />
      <Route path=":id" element={<div>Book Details</div>} />
    </Routes>
  );
}

// todo: move to its own folder when pages are finalized on
function MyLibraryRoutes() {
  return (
    <Routes>
      <Route index element={<div>My Library Overview</div>} />
      <Route path="borrowed" element={<div>My Borrowed Books</div>} />
      <Route path="reservations" element={<div>My Reservations</div>} />
      <Route path="history" element={<div>My Transaction History</div>} />
    </Routes>
  );
}

// todo: move to its own folder when pages are finalized on
function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<div>Admin Dashboard</div>} />
      <Route path="books" element={<div>Manage Books</div>} />
      <Route path="users" element={<div>Manage Users</div>} />
      <Route path="borrowed" element={<div>Manage Borrowed Books</div>} />
      <Route path="reservations" element={<div>Manage Reservations</div>} />
      <Route path="transactions" element={<div>All Transactions</div>} />
    </Routes>
  );
}

// The main routes of the app
function MainRoutes() {
  const user = useAuthStore((s) => s.user);

  const isAdmin = user?.role === "admin";

  return (
    <MainLayout>
      <Routes>
        <Route index element={<Home />} />
        <Route path="home" element={<Navigate replace to={"/"} />} />
        <Route path="catalog/*" element={<CatalogRoutes />} />
        <Route path="my-library/*" element={<MyLibraryRoutes />} />
        <Route path="profile" element={<div>My Profile</div>} />
        {isAdmin && <Route path="admin/*" element={<AdminRoutes />} />}
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

// function NotFound() {
//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center gap-6">
//       <h1 className="text-6xl font-bold text-foreground">404</h1>
//       <p className="text-xl text-muted-foreground">Oops! Page not found</p>
//       <Separator className="my-4 h-1 w-24 rounded bg-primary" />
//       <p className="mb-6 text-muted-foreground">
//         The page you're looking for doesn't exist or has been moved.
//       </p>
//       <Button asChild size="lg">
//         <Link to="/">Go Home</Link>
//       </Button>
//     </div>
//   );
// }
