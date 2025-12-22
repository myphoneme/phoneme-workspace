# Project Overview

This is a full-stack task manager application built with a React frontend and an Express backend. The application allows users to create, manage, and collaborate on tasks, including assigning tasks to other users and adding comments.

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for building and development
- **TailwindCSS** for styling
- **TanStack Query** for data fetching and state management
- **Google OAuth** for authentication

### Backend
- **Express** with TypeScript
- **SQLite** (`better-sqlite3`) for the database
- **CORS** for cross-origin resource sharing
- **JWT** for authentication

## Project Structure

The project is divided into two main directories: `client` and `server`.

- `client/`: Contains the frontend React application.
  - `src/api/`: Functions for making API requests to the backend.
  - `src/components/`: Reusable React components.
  - `src/contexts/`: React contexts for authentication and theme management.
  - `src/hooks/`: Custom hooks for data fetching with TanStack Query.
  - `certs/`: Contains the self-signed certificate for HTTPS.
  - `src/App.tsx`: The main application component.
  - `src/main.tsx`: The entry point of the React application.
- `server/`: Contains the backend Express application.
  - `src/routes/`: API routes for different resources (todos, comments, etc.).
  - `src/db.ts`: Database setup and configuration.
  - `src/index.ts`: The entry point of the Express server.

## Building and Running

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm
- pm2 (globally installed)

### Installation

1.  **Install server dependencies:**
    ```bash
    cd server
    npm install
    ```

2.  **Install client dependencies:**
    ```bash
    cd ../client
    npm install
    ```

### Running the Application with PM2

The application is configured to run with `pm2`.

1.  **Start the backend server:**
    ```bash
    cd server
    pm2 start "npm run dev" --name "phoneme-server"
    ```

2.  **Start the frontend client:**
    ```bash
    cd ../client
    pm2 start "npm run dev" --name "phoneme-client"
    ```

### Running the Application Manually

You can also run the application manually in separate terminals.

#### Terminal 1 - Start the Backend Server
```bash
cd server
npm run dev
```
The server will start on `http://localhost:3001`.

#### Terminal 2 - Start the Frontend Client
```bash
cd client
npm run dev
```
The client will start on `https://10.100.60.111:5173`.

## Development Conventions

- The codebase is written in TypeScript.
- The frontend uses functional components with hooks and is configured to use a self-signed certificate for HTTPS.
- The backend uses a modular structure with routes separated by concern.
- The project uses `eslint` for linting. To run the linter, navigate to the `client` directory and run `npm run lint`.

## Debugging CORS and WebSocket Errors

There are known issues with CORS and WebSocket connections.

### CORS Issue

The client is making requests to `http://api.phoneme.in:9000` instead of `https`. This is causing CORS errors.

A temporary fix has been applied to `client/src/api/client.ts` to force the use of `https`.

**Important:** After this change, you need to rebuild the client application and deploy it again.

```bash
cd client
npm run build
```

### WebSocket Issue

There is a known issue with a WebSocket connection failing to `wss://api.phoneme.in:9000`. The source of this WebSocket connection is not in the application code. Here are some steps to debug this issue:

**Summary of Findings:**

*   The initial errors reported by the user were a mix of CORS errors and a WebSocket connection failure.
*   The CORS errors were caused by a misconfiguration on the Express server. This has been fixed by adding the correct origins to the `allowedOrigins` array in `server/src/index.ts`.
*   The WebSocket connection to `wss://api.phoneme.in:9000` is still failing.
*   A thorough investigation of the client-side and server-side code did not reveal any code that initiates a WebSocket connection.
*   The WebSocket connection URL contains an authentication token, which suggests that it's initiated after the user logs in.

**Next Steps:**

1.  **Check for browser extensions:** Disable all browser extensions and see if the error persists. Some extensions can inject scripts that interfere with the application.
2.  **Check for other processes:** Use your operating system's tools to check for other processes that might be making network connections to `wss://api.phoneme.in:9000`.
3.  **Provide more information:** If the issue persists, please provide more information about your environment, including:
    *   The browser you are using.
    *   A list of any browser extensions you have installed.
    *   Any other software you are running that might be making network connections.
