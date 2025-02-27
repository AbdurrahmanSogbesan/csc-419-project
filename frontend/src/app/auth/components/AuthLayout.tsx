import { Outlet } from "react-router";

// temporary auth UI
export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="hidden w-1/2 flex-col justify-center bg-blue-600 p-12 lg:flex">
        <div className="mx-auto max-w-md">
          <h1 className="text-4xl font-bold text-white">Library App</h1>
          <p className="mt-4 text-xl text-blue-100">
            Your gateway to a world of knowledge and discovery.
          </p>
          <div className="mt-8 h-1 w-16 bg-blue-400"></div>
          <div className="mt-8 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Extensive Collection
                </h3>
                <p className="text-blue-200">
                  Access thousands of books across various genres.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Easy Borrowing</h3>
                <p className="text-blue-200">
                  Simple process to borrow and return books.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Track Your Reading</h3>
                <p className="text-blue-200">
                  Keep a history of your reading journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Right side - auth forms */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <div className="mb-8 text-center lg:hidden">
          <h1 className="text-3xl font-bold text-blue-600">Library App</h1>
          <p className="mt-2 text-gray-600">Your gateway to knowledge</p>
        </div>

        <div className="w-full max-w-md">
          <Outlet />
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>© 2023 Library App. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
