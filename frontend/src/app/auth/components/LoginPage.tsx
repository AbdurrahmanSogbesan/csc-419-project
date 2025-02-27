import { useState } from "react";
import { Link } from "react-router";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the login logic
    console.log("Login attempt with:", { email, password });
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Please sign in to your account.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
