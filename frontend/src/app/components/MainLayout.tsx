import { ReactNode } from "react";
import { NavLink } from "react-router";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="bg-blue-700 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-3xl font-bold">My Application</h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <NavLink
                  className="transition hover:text-blue-300"
                  to="/dashboard"
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  className="transition hover:text-blue-300"
                  to="/transactions"
                >
                  Transactions
                </NavLink>
              </li>
              <li>
                <NavLink
                  className="transition hover:text-blue-300"
                  to="/budgets"
                >
                  Budgets
                </NavLink>
              </li>
              <li>
                <NavLink
                  className="transition hover:text-blue-300"
                  to="/savings-goals"
                >
                  Savings Goals
                </NavLink>
              </li>
              <li>
                <NavLink
                  className="transition hover:text-blue-300"
                  to="/account"
                >
                  Account
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl flex-1 p-6">{children}</main>
      <footer className="bg-gray-800 p-4 text-center text-white">
        <p>© 2023 My Application</p>
      </footer>
    </div>
  );
}
