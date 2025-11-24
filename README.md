# Task Manager - Collaborative TODO App

A full-stack TODO application built with React, Vite, TailwindCSS, Express, TypeScript, and SQLite. Features collaborative task management with assigner/assignee roles and comments.

## Features

- Create, read, update, and delete tasks
- Assign tasks with assigner and assignee fields
- Mark tasks as complete/incomplete
- Add comments to tasks (both assigner and assignee can comment)
- Real-time updates with TanStack Query
- Beautiful UI with TailwindCSS
- Persistent storage with SQLite

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** (v7.0.0) - Build tool
- **TailwindCSS** - Styling
- **TanStack Query** - Data fetching and state management

### Backend
- **Express** with TypeScript
- **SQLite** (better-sqlite3) - Database
- **CORS** enabled

## Project Structure

```
blog/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom TanStack Query hooks
│   │   ├── types.ts       # TypeScript type definitions
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   └── package.json
│
└── server/                # Backend Express application
    ├── src/
    │   ├── routes/        # API routes
    │   ├── db.ts          # Database setup
    │   ├── types.ts       # TypeScript type definitions
    │   └── index.ts       # Server entry point
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm

### Installation

1. **Clone the repository**
   ```bash
   cd blog
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

You need to run both the server and client in separate terminals.

#### Terminal 1 - Start the Backend Server
```bash
cd server
npm run dev
```
The server will start on `http://localhost:3001`

#### Terminal 2 - Start the Frontend Client
```bash
cd client
npm run dev
```
The client will start on `http://localhost:5173`

### Building for Production

#### Build the server
```bash
cd server
npm run build
npm start
```

#### Build the client
```bash
cd client
npm run build
```

## API Endpoints

### Todos
- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get a single todo
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

### Comments
- `GET /api/comments/todo/:todoId` - Get all comments for a todo
- `POST /api/comments` - Create a new comment
- `DELETE /api/comments/:id` - Delete a comment

## Usage

1. **Create a Task**: Fill in the form with title, description, your name (assigner), and assignee name
2. **Mark as Complete**: Click the checkbox next to any task
3. **Edit a Task**: Click the "Edit" button to modify title, description, or assignee
4. **Delete a Task**: Click the "Delete" button (confirmation required)
5. **Add Comments**: Click "Show Comments" and use the comment form
6. **View Comments**: All comments are visible with author name and timestamp

## Database

The SQLite database file (`database.sqlite`) is automatically created in the `server` directory on first run.

### Schema

**todos**
- id (INTEGER PRIMARY KEY)
- title (TEXT)
- description (TEXT)
- assigner (TEXT)
- assignee (TEXT)
- completed (INTEGER/BOOLEAN)
- createdAt (TEXT/DATETIME)
- updatedAt (TEXT/DATETIME)

**comments**
- id (INTEGER PRIMARY KEY)
- todoId (INTEGER, FOREIGN KEY)
- author (TEXT)
- content (TEXT)
- createdAt (TEXT/DATETIME)

## Development

- The frontend uses Vite's HMR for instant updates during development
- The backend uses nodemon and tsx for automatic TypeScript compilation and server restart
- TanStack Query DevTools are available in development mode (bottom-left corner)

## License

ISC
