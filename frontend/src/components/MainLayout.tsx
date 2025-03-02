import { ReactNode } from "react";
import { NavLink } from "react-router";
import { useAuthStore } from "@/lib/stores/auth";
import { Button } from "./ui/button";

// temp app layout (needs sidebar, etc)
export default function MainLayout({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = user?.role === "admin";

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <NavLink
              to="/"
              className="text-2xl font-bold text-blue-600 hover:text-blue-700"
            >
              Library App
            </NavLink>
          </div>

          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li>
                <NavLink
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 transition ${
                      isActive
                        ? "bg-blue-50 font-medium text-blue-600"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }`
                  }
                  to="/"
                  end
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 transition ${
                      isActive
                        ? "bg-blue-50 font-medium text-blue-600"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }`
                  }
                  to="/catalog"
                >
                  Book Catalog
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 transition ${
                      isActive
                        ? "bg-blue-50 font-medium text-blue-600"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }`
                  }
                  to="/my-library"
                >
                  My Library
                </NavLink>
              </li>
              {isAdmin && (
                <li>
                  <NavLink
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 transition ${
                        isActive
                          ? "bg-blue-50 font-medium text-blue-600"
                          : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                      }`
                    }
                    to="/admin"
                  >
                    Admin
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>

          <div className="flex items-center space-x-4">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 transition ${
                  isActive
                    ? "bg-blue-50 font-medium text-blue-600"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`
              }
            >
              Profile
            </NavLink>
            <Button
              className="ml-4 rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
              onClick={logout}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 p-6">
        <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          {children}
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-gray-600">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="text-sm">© 2023 Library App. All rights reserved.</p>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <a
                href="#"
                className="text-gray-500 transition hover:text-blue-600"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-500 transition hover:text-blue-600"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-500 transition hover:text-blue-600"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
