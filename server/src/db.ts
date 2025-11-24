import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';

// Use process.cwd() for reliable path with tsx
const dbPath = path.join(process.cwd(), 'database.sqlite');
console.log('Database path:', dbPath);
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
    isActive INTEGER DEFAULT 1,
    profilePhoto TEXT,
    lastLoginAt TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    relatedId INTEGER,
    isRead INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    assignerId INTEGER NOT NULL,
    assigneeId INTEGER NOT NULL,
    completed INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
    isFavorite INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (assignerId) REFERENCES users(id),
    FOREIGN KEY (assigneeId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todoId INTEGER NOT NULL,
    authorId INTEGER NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (todoId) REFERENCES todos(id) ON DELETE CASCADE,
    FOREIGN KEY (authorId) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_comments_todoId ON comments(todoId);
  CREATE INDEX IF NOT EXISTS idx_todos_assignerId ON todos(assignerId);
  CREATE INDEX IF NOT EXISTS idx_todos_assigneeId ON todos(assigneeId);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`);

// Migration: Add new columns to users table if they don't exist
const userColumns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
const columnNames = userColumns.map(c => c.name);

if (!columnNames.includes('profilePhoto')) {
  db.exec('ALTER TABLE users ADD COLUMN profilePhoto TEXT');
  console.log('Added profilePhoto column to users table');
}

if (!columnNames.includes('lastLoginAt')) {
  db.exec('ALTER TABLE users ADD COLUMN lastLoginAt TEXT');
  console.log('Added lastLoginAt column to users table');
}

// Migration: Add new columns to todos table if they don't exist
const todoColumns = db.prepare("PRAGMA table_info(todos)").all() as Array<{ name: string }>;
const todoColumnNames = todoColumns.map(c => c.name);

if (!todoColumnNames.includes('priority')) {
  db.exec("ALTER TABLE todos ADD COLUMN priority TEXT DEFAULT 'medium'");
  console.log('Added priority column to todos table');
}

if (!todoColumnNames.includes('isFavorite')) {
  db.exec('ALTER TABLE todos ADD COLUMN isFavorite INTEGER DEFAULT 0');
  console.log('Added isFavorite column to todos table');
}

if (!todoColumnNames.includes('dueDate')) {
  db.exec('ALTER TABLE todos ADD COLUMN dueDate TEXT');
  console.log('Added dueDate column to todos table');
}

// Seed default admin user if no users exist
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync('Solution@1979', 12);
  db.prepare(`
    INSERT INTO users (email, password, name, role)
    VALUES (?, ?, ?, ?)
  `).run('phoneme2016@gmail.com', hashedPassword, 'Admin', 'admin');
  console.log('Default admin user created: phoneme2016@gmail.com');
}

// Seed default allowed domains setting if not exists
const domainSetting = db.prepare('SELECT * FROM settings WHERE key = ?').get('allowed_domains');
if (!domainSetting) {
  db.prepare(`
    INSERT INTO settings (key, value)
    VALUES (?, ?)
  `).run('allowed_domains', JSON.stringify(['gmail.com']));
  console.log('Default allowed domains setting created');
}

export default db;
