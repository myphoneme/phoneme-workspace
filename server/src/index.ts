import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import settingsRouter from './routes/settings';
import todosRouter from './routes/todos';
import commentsRouter from './routes/comments';
import notificationsRouter from './routes/notifications';
import aiRouter from './routes/ai';
import projectsRouter from './routes/projects';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/todos', todosRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/projects', projectsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
