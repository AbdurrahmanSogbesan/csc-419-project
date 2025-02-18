import { ReactNode } from "react";
import { Navigate, Route, Routes , useLocation } from "react-router";
import MainLayout from "./MainLayout";
import { AuthRoutes } from "@/auth";
import Home from "@/home";

// Our auth middleware component
function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = { user: true };
  const location = useLocation();

  if (user) {
    return children;
  }
  return <Navigate replace to={"/auth"} state={{ from: location }} />;
}

// The pages of the app
function MainRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Navigate replace to={"/"} />} />
        <Route
          path="transactions"
          element={<div>Transactions Management</div>}
        />
        <Route path="budgets" element={<div>Budget Tracking</div>} />
        <Route path="savings-goals" element={<div>Savings Goals</div>} />
        <Route path="account" element={<div>User Account</div>} />
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
