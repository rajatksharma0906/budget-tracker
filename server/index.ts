import 'dotenv/config';
import path from 'path';
import next from 'next';
import express, { Request, Response } from 'express';
import authRoutes from '@/server/routes/auth';
import profileRoutes from '@/server/routes/profile';
import adminRoutes from '@/server/routes/admin';
import expensesRoutes from '@/server/routes/expenses';
import billsRoutes from '@/server/routes/bills';
import settingsRoutes from '@/server/routes/settings';
import summaryRoutes from '@/server/routes/summary';
import reportsRoutes from '@/server/routes/reports';

const dev = process.env.NODE_ENV !== 'production';
const port = Number(process.env.PORT) || 3001;
const hostname = process.env.HOSTNAME || '0.0.0.0';

// Next.js app dir = project root (where package.json and app/ live)
const nextDir = path.resolve(process.cwd());

const app = next({ dev, dir: nextDir });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(express.json({
      verify: (req: express.Request, _res, buf) => {
        (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
      },
    }));

    // Health check (no DB required)
    server.get('/health', (_req, res) => {
      res.status(200).json({ ok: true });
    });

    // Backend API (Express)
    server.use('/api/auth', authRoutes);
    server.use('/api/profile', profileRoutes);
    server.use('/api/admin', adminRoutes);
    server.use('/api/expenses', expensesRoutes);
    server.use('/api/bills', billsRoutes);
    server.use('/api/settings', settingsRoutes);
    server.use('/api/summary', summaryRoutes);
    server.use('/api/reports', reportsRoutes);

    // Everything else → Next.js (UI)
    server.all('*', (req: Request, res: Response) => {
      return handle(req, res);
    });

    server.listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname === '0.0.0.0' ? 'localhost' : hostname}:${port} (Express + Next.js)`);
    });
  })
  .catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
