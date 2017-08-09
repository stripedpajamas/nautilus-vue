import Koa from 'koa';
import helmet from 'koa-helmet';
import koaJwt from 'koa-jwt';
import jwt from 'jsonwebtoken';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import mongoose from 'mongoose';
import path from 'path';
import http from 'http';
import websockify from 'koa-websocket';
import { apiRouter, wsRouter } from './router';
import connectDatabase from './data/db';

const jwtSecret = process.env.JWT_SECRET || 'twoseventythree tomato sauce';

/**
 * JWT verify function for WebSocket connection
 */
const verifyClient = (info, cb) => {
  const token = info.req.headers['sec-websocket-protocol'];
  if (!token) return cb(false, 401, 'Unauthorized');
  return jwt.verify(token, jwtSecret, (err) => {
    if (err) return cb(false, 401, 'Unauthorized');
    return cb(true);
  });
};

const app = new Koa();
const wsApp = new Koa();
websockify(wsApp, {
  verifyClient,
});

/**
 * Middleware init
 */
app.use(helmet());
app.use(bodyParser());

/* Catch 401s */
app.use((ctx, next) => (
  next().catch((err) => {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = 'Protected resource, use Authorization header to get access.';
    } else {
      throw err;
    }
  })
));

/* Set CORS policy */
const setCors = (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, token');
  ctx.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  if (ctx.method === 'OPTIONS') {
    ctx.status = 200;
  }
  return next();
};
app.use(setCors);
wsApp.use(setCors);

/* Lock down routes with JWTs */
app.use(koaJwt({ secret: jwtSecret }).unless({ method: 'OPTIONS', path: [/^\/api\/users\/login/] }));

/* Check for DB connection on every API request */
app.use((ctx, next) => {
  if (ctx.path.includes('/api')) {
    ctx.assert(mongoose.connection.readyState === 1, 503, 'Not connected to MongoDB');
  }
  return next();
});

/* Load routes */
app.use(apiRouter.middleware());
wsApp.ws.use(wsRouter.middleware());

/* Serve Vue app */
app.use(serve(path.resolve(__dirname, '../../dist')));

/**
 * Handle server errors
 */
app.on('error', (error, ctx) => {
  // TODO handle errors with pino
  console.log('Server error:', error.message, ctx);
});

/**
 * Connect to MongoDB, start Socket.io, start servers
 */
(async () => {
  try {
    await connectDatabase('mongodb://localhost/nautilus');
  } catch (e) {
    console.error('Could not connect to MongoDB:', e.message);
    process.exit();
  }
  const httpServer = await http.createServer(app.callback());
  await httpServer.listen(process.env.PORT || 9090);
  await wsApp.listen(6993);
  console.log(`Server started on port ${process.env.PORT || 9090}`);
  console.log('WS Server started on port 6993');
})();
