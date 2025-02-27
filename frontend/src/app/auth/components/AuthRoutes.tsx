import AuthLayout from "./AuthLayout";
import { Navigate, Route, Routes } from "react-router";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

export default function AuthRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Navigate replace to="login" />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
}
