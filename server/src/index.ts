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
import dashboardRouter from './routes/dashboard';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:5173',
  'http://10.100.60.111:5173',
  'http://phoneme.in',
  'https://phoneme.in',
  'http://api.phoneme.in',
  'http://api.phoneme.in:9000',
  'https://api.phoneme.in',
  'https://api.phoneme.in:9000',
  'http://api.phoneme.in:9001',
  'https://api.phoneme.in:9001',
  'https://www.phoneme.in',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
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
app.use('/api/dashboard', dashboardRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
