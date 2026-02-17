import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import quoteRoutes from './routes/quotes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/quotes', quoteRoutes);

// Serve frontend in production
app.use(express.static(join(__dirname, '../client/dist')));
app.get('/{*path}', (req, res) => {
  res.sendFile(join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => console.log(`🔨 QuoteCraft server running on port ${PORT}`));
