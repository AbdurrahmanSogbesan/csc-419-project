# Library Management System

A web-based library management system built with React and Nest.js.

## Overview

This application is designed to manage library resources, including books, authors, and borrowers. The frontend is built using React, providing a user-friendly interface for users to interact with the system. The backend is built using Nest.js, handling API requests and database operations.

## Features

- Book management: add, remove, and update book records
- Borrower management: add, remove, and update borrower records
- Search and filter functionality for books and authors
- User authentication and role-based access control
- Reservation system for books

## Technologies Used

- Frontend: React and Vite
- Backend: Nest.js
- Database: PostgreSQL (Prisma ORM)

## Getting Started

To get started with the application, please follow these steps:

1. Clone the repository
2. Install dependencies using npm or yarn:

```bash
  # Install frontend dependencies
  cd frontend
  yarn install

  # Install backend dependencies
  cd ../backend
  yarn install
```

3. Set up the database:

   - Create a `.env` file in the backend directory
   - Configure your PostgreSQL connection string
   - Run migrations: `yarn migrate`
   - Generate Prisma client: `yarn generate`

4. Start the development servers:

   ```bash
   # Start backend (from backend directory)
   yarn start:dev

   # Start frontend (from frontend directory)
   yarn dev
   ```

## Contributing

Contributions are welcome! Please submit a pull request with your changes and a brief description of what you've added or fixed.
