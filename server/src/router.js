import Router from 'koa-better-router';
import jwt from 'jsonwebtoken';
import Pino from 'pino';
import ps from './shell';
import User from './data/models/User';
import Client from './data/models/Client';
import auth from './auth';

const jwtSecret = process.env.JWT_SECRET || 'twoseventythree tomato sauce';
const pino = Pino({
  level: process.env.DEBUG ? 'debug' : 'info',
});

/**
 * Router for the API
 */
const apiRouter = Router({ prefix: '/api' }).loadMethods();
const wsRouter = Router().loadMethods();

/**
 * WebSocket
 */
wsRouter.get('/*', ps);

/**
 * JWT Check
 */
apiRouter.get('/check', (ctx) => {
  pino.debug(ctx, 'Check endpoint hit, JWT valid');
  ctx.body = { ok: true };
});

/**
 * Clients
 */
apiRouter.get('/clients', async (ctx) => {
  pino.debug(ctx, 'Clients endpoint hit');
  try {
    const data = await Client.find();
    pino.debug('Retrieved client list from database successfully');
    ctx.body = { ok: true, data };
  } catch (e) {
    pino.error({ error: e.message }, 'Failed to retrieve client list from database');
    ctx.status = 503;
    ctx.body = { ok: false, message: e.message };
  }
});

apiRouter.post('/clients', async (ctx) => {
  pino.debug(ctx, 'Clients endpoint posted to');
  const { name, domain, defaultCreds } = ctx.request.body;
  if (name && domain && typeof defaultCreds !== 'undefined') {
    try {
      await Client.create({ name, domain, defaultCreds });
      pino.info({ name, domain, defaultCreds }, 'Added new client to MongoDB');
      ctx.body = { ok: true };
    } catch (e) {
      pino.error({ name, domain, defaultCreds }, 'Failed to add new client to MongoDB');
      ctx.status = 503;
      ctx.body = { ok: false, message: e.message };
    }
  } else {
    pino.warn(ctx, 'Missing parameters in post data');
    ctx.status = 503;
    ctx.body = { ok: false, message: 'Missing parameters' };
  }
});

apiRouter.get('/clients/:id', async (ctx) => {
  pino.debug(ctx, 'Specific client id endpoint requested');
  try {
    const data = await Client.findOne({ _id: ctx.params.id });
    pino.debug({ data }, 'Client info retrieved');
    ctx.body = { ok: true, data };
  } catch (e) {
    pino.error({ id: ctx.params.id }, 'Failed to retrieve client info from database');
    ctx.status = 503;
    ctx.body = { ok: false, message: e.message };
  }
});

apiRouter.del('/clients/:id', async (ctx) => {
  pino.debug(ctx, 'Delete specific client id endpoint requested');
  try {
    await Client.findByIdAndRemove(ctx.params.id);
    pino.info({ id: ctx.params.id }, 'Client deleted');
    ctx.body = { ok: true };
  } catch (e) {
    pino.error({ id: ctx.params.id }, 'Failed to delete client');
    ctx.status = 503;
    ctx.body = { ok: false, message: e.message };
  }
});

apiRouter.put('/clients/:id', async (ctx) => {
  pino.debug(ctx, 'Edit specific client id endpoint requested');
  const { name, domain, defaultCreds } = ctx.request.body;
  try {
    await Client.findByIdAndUpdate(ctx.params.id, { name, domain, defaultCreds });
    pino.info({ id: ctx.params.id, name, domain, defaultCreds }, 'Client edited successfully');
    ctx.body = { ok: true };
  } catch (e) {
    pino.error({ id: ctx.params.id }, 'Failed to edit client');
    ctx.status = 503;
    ctx.body = { ok: false, message: e.message };
  }
});

/**
 * Users
 */
apiRouter.post('/users/login', async (ctx) => {
  pino.debug(ctx, 'User login endpoint requested');
  const { username, password } = ctx.request.body;
  const user = await auth.authenticate(username, password);
  if (user.error) {
    pino.warn(user, 'User authentication failed');
    ctx.status = 401;
    ctx.body = { ok: false, message: user.error };
  } else {
    pino.info(user, 'User authenticated successfully, issuing JWT');
    const token = jwt.sign({ data: user }, jwtSecret, { expiresIn: '1d' });
    ctx.body = { ok: true, jwt: token };
  }
});

apiRouter.get('/users', async (ctx) => {
  pino.debug(ctx, 'Users list endpoint requested');
  try {
    const data = await User.find({}, 'fullName username isAdmin');
    pino.debug(data, 'User list retrieved');
    ctx.body = { ok: true, data };
  } catch (e) {
    pino.error(ctx, 'Failed to retrieve user list');
    ctx.status = 503;
    ctx.body = { ok: false, message: e.message };
  }
});

apiRouter.post('/users', async (ctx) => {
  pino.debug(ctx, 'Register new user endpoint requested');
  const { fullName, username, password, isAdmin } = ctx.request.body;
  try {
    await auth.register({ fullName, username, password, isAdmin });
    pino.info({ fullName, username, isAdmin }, 'User added successfully');
    ctx.body = { ok: true };
  } catch (e) {
    pino.error({ fullName, username, isAdmin }, 'Failed to add user');
    ctx.status = 503;
    ctx.body = { ok: false, message: e.message };
  }
});

apiRouter.del('/users/:id', async (ctx) => {
  pino.debug(ctx, 'Delete user endpoint requested');
  try {
    await User.findByIdAndRemove(ctx.params.id);
    pino.info({ id: ctx.params.id }, 'User deleted successfully');
    ctx.body = { ok: true };
  } catch (e) {
    pino.error({ id: ctx.params.id }, 'Failed to delete user');
    ctx.status = 503;
    ctx.body = { ok: false, message: e.message };
  }
});

apiRouter.put('/users/:id', async (ctx) => {
  pino.debug(ctx, 'Edit user endpoint requested');
  const { fullName, username, isAdmin, password } = ctx.request.body;
  return User.findById(ctx.params.id)
      .then((u) => {
        pino.debug({ id: ctx.params.id }, 'Found user to edit in database');
        const user = u;
        user.fullName = fullName;
        user.username = username;
        user.isAdmin = isAdmin;
        if (password) {
          pino.debug({ id: ctx.params.id }, 'Password change requested for this user');
          user.password = password;
        }
        return user.save()
          .then(() => {
            pino.info({ fullName, username, isAdmin, id: ctx.params.id }, 'Successfully edited user');
            ctx.body = { ok: true };
          });
      })
    .catch((e) => {
      pino.error({ id: ctx.params.id }, 'Failed to edit user');
      ctx.status = 503;
      ctx.body = { ok: false, message: e.message };
    });
});

export {
  apiRouter,
  wsRouter,
};
