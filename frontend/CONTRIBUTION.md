# Project Setup and Contribution Guide

## Setting Up the Project

### 1. Clone the Repository

```sh
git clone <repository-url>
```

### 2. Open the Project in Your IDE

Navigate to the cloned project folder and open it in your preferred IDE (VS Code, WebStorm, etc.).

### 3. Install Dependencies

```sh
cd frontend
yarn
```

- If you don’t have `yarn` installed, install it first:

  ```sh
  npm install -g yarn
  ```

- If you don’t have `npm`, install [Node.js](https://nodejs.org/) (which includes `npm`).

### 4. Set Up Environment Variables

- Create a `.env` file in the root of the frontend directory.
- Add the required environment variables.

### 5. Run the Development Server

```sh
yarn dev
```

- Alternatively, use:

  ```sh
  npm run dev
  ```

---

## Working on a New Feature

### 1. Ensure You Are on the `main` Branch

```sh
git checkout main
git pull origin main
```

### 2. Create a New Branch

Use the following naming convention based on the type of change:

```sh
git checkout -b <type>/short-description
```

- Feature: `feature/` for new features
- Fix: `fix/` for bug fixes
- Chore: `chore/` for maintenance tasks
- Refactor: `refactor/` for code improvements

Examples:

```sh
git checkout -b feature/login-api
git checkout -b fix/typo-in-footer
git checkout -b chore/update-dependencies
git checkout -b refactor/improve-auth-flow
```

### 3. Work on the Feature

- Make changes, test your code, and commit often.
- To commit:

  ```sh
  git add .
  git commit -m "Short, clear description of changes"
  ```

### 4. Publish Your Branch

```sh
git push origin feature/short-description
```

- Alternatively, you can use the VS Code UI to publish the branch.

### 5. Create a Pull Request (PR)

- Open GitHub/GitLab, navigate to the repository, and create a PR.
- Request a review from a team member.

### 6. Merge the PR

- Once approved and there are no merge conflicts, merge the PR into `main`.

### 7. Repeat for a New Feature

- After merging, switch back to `main`, pull the latest changes, and create a new feature branch.
