import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import quoteRoutes from './routes/quotes.js';
import chatRoutes from './routes/chat.js';
import clientRoutes from './routes/clients.js';
import jobRoutes from './routes/jobs.js';
import followupRoutes from './routes/followups.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/followups', followupRoutes);

// Serve uploads
app.use('/api/uploads', express.static(join(__dirname, 'uploads')));

// Serve frontend in production
const distPath = '/home/chip/.openclaw/workspace/quotecraft/client/dist';
const indexHtml = readFileSync(distPath + '/index.html', 'utf8');
app.use(express.static(distPath));
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.type('html').send(indexHtml);
});

app.listen(PORT, () => console.log(`🔨 QuoteCraft server running on port ${PORT}`));
