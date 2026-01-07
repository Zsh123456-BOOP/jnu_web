import './env.js';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { sessionMiddleware } from './session.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

const app = express();

app.disable('x-powered-by');
app.disable('etag');
app.set('trust proxy', 1);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(sessionMiddleware);

app.use('/static', express.static(config.storageDir));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString()
  });
});

app.get('/api/session', (req, res) => {
  req.session.ping = Date.now();
  res.json({
    ok: true,
    sessionId: req.sessionID
  });
});

app.use('/api', adminRoutes);
app.use('/api', publicRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});
