import Koa from 'koa';
import helmet from 'koa-helmet';
import koaJwt from 'koa-jwt';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import mongoose from 'mongoose';
import path from 'path';
import http from 'http';
import io from 'socket.io';
import apiRouter from './router';
import connectDatabase from './data/db';

const app = new Koa();

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
app.use((ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  ctx.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  if (ctx.method === 'OPTIONS') {
    ctx.status = 200;
  }
  return next();
});

/* Lock down routes with JWTs */
app.use(koaJwt({ secret: 'twoseventythree tomato sauce' }).unless({ method: 'OPTIONS', path: [/^\/api\/users\/login/] }));

/* Check for DB connection on every API request */
app.use((ctx, next) => {
  if (ctx.path.includes('/api')) {
    ctx.assert(mongoose.connection.readyState === 1, 503, 'Not connected to MongoDB');
  }
  return next();
});

/* Load routes */
app.use(apiRouter.middleware());

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
 * Connect to MongoDB, start Socket.io, start server
 */
(async () => {
  try {
    await connectDatabase('mongodb://localhost/nautilus');
  } catch (e) {
    console.error('Could not connect to MongoDB:', e.message);
    process.exit();
  }
  const httpServer = await http.createServer(app.callback());
  await io(httpServer);
  await httpServer.listen(process.env.PORT || 9090);
  console.log(`Server started on port ${process.env.PORT || 9090}`);
})();
