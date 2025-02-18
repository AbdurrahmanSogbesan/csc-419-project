import { Navigate, Route } from "react-router";
import { Routes } from "react-router";

export default function AuthRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div>Auth Layout</div>}>
        <Route index element={<Navigate replace to="login" />} />
        <Route path="login" element={<div>Login</div>} />
        <Route path="register" element={<div>Register</div>} />
      </Route>
    </Routes>
  );
}
