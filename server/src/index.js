import Koa from 'koa';
import helmet from 'koa-helmet';
import koaJwt from 'koa-jwt';
import jwt from 'jsonwebtoken';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import mongoose from 'mongoose';
import path from 'path';
import http from 'http';
import https from 'https';
import sslify from 'koa-sslify';
import websockify from 'koa-wss';
import le from './lib/cert';
import pino from './lib/logger';
import { apiRouter, dnsRouter, wsRouter } from './router';
import connectDatabase from './data/db';

const jwtSecret = process.env.JWT_SECRET || 'twoseventythree tomato sauce';
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost/nautilus2';

/**
 * JWT verify function for WebSocket connection
 */
const verifyClient = (info, cb) => {
  pino.debug(info.req, 'Verifying WebSocket client is authenticated');
  const token = info.req.headers['sec-websocket-protocol'];
  if (!token) {
    pino.warn(info.req, 'No token found for WebSocket client -- Unauthorized');
    return cb(false, 401, 'Unauthorized');
  }
  return jwt.verify(token, jwtSecret, (err) => {
    if (err) {
      pino.warn(info.req, 'Token supplied for WebSocket client was invalid -- Unauthorized');
      return cb(false, 401, 'Unauthorized');
    }
    pino.debug(info.req, 'WebSocket client is using valid JWT -- Authorized');
    return cb(true);
  });
};

pino.debug('Initializing API server and WebSocket server');
const app = new Koa();
const wsApp = new Koa();
websockify(wsApp, {
  verifyClient,
}, le.httpsOptions);

/**
 * Middleware init
 */
pino.debug('Initializing middleware');
app.use(helmet());
app.use(bodyParser());

/* Catch 401s */
app.use((ctx, next) => (
  next().catch((err) => {
    if (err.status === 401) {
      pino.warn(ctx, 'Attempt to access protected resource without Authorization');
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

/* Serve Vue app */
pino.debug('Serving up the Vue app');
app.use(serve(path.resolve(__dirname, '../../dist')));

/* Lock down routes with JWTs */
app.use(koaJwt({ secret: jwtSecret }).unless({ method: 'OPTIONS', path: [/^\/(?:api\/users\/login)|(?:dns)/] }));

/* Check for DB connection on every API request */
app.use((ctx, next) => {
  if (ctx.path.includes('/api') || ctx.path.includes('/dns')) {
    pino.debug(ctx, 'API endpoint hit, checking connection to MongoDB');
    ctx.assert(mongoose.connection.readyState === 1, 503, 'Not connected to MongoDB');
  }
  return next();
});

/* Load routes */
pino.debug('Loading routes for API and WebSocket');
app.use(apiRouter.middleware());
app.use(dnsRouter.middleware());
wsApp.ws.use(wsRouter.middleware());

/* Serve Vue app */
pino.debug('Serving up the Vue app');
app.use(serve(path.resolve(__dirname, '../../dist')));

/**
 * Handle server errors
 */
app.on('error', (error, ctx) => {
  pino.error({ error: error.message, ctx }, 'Server error');
});

/**
 * Connect to MongoDB, start Socket.io, start servers
 */
pino.debug('Starting up everything');
(async () => {
  try {
    await connectDatabase(mongoUri);
    pino.debug('Connected to MongoDB');
  } catch (e) {
    pino.error({ error: e.message }, 'Could not connect to MongoDB');
    process.exit(1);
  }

  try {
    let server;

    if (process.env.NODE_ENV === 'production') {
      server = await https.createServer(le.httpsOptions, le.middleware(app.callback()));
      await server.listen(443);
      pino.info('HTTPS Server started on port 443');
      await http.createServer(le.middleware((new Koa()).use(sslify()).callback())).listen(80);
      pino.info('HTTP Redirect server started on port 80');
    } else {
      server = await http.createServer(app.callback());
      await server.listen(process.env.PORT || 8080);
      pino.info(`HTTP Server started on port ${process.env.PORT || 8080}`);
    }
    await wsApp.listen(6993);
    pino.info('WS Server started on port 6993');
  } catch (e) {
    pino.error(e, 'Failed to start servers');
  }
})();
