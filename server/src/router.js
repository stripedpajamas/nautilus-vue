import Router from 'koa-better-router';
import jwt from 'jsonwebtoken';
import User from './data/models/User';
import Client from './data/models/Client';
import auth from './auth';

/**
 * Router for the API
 */
const apiRouter = Router({ prefix: '/api' }).loadMethods();

/**
 * Clients
 */
apiRouter.get('/clients', async (ctx) => {
  try {
    const data = await Client.find();
    ctx.body = { ok: true, data };
  } catch (e) {
    ctx.status = 503;
    ctx.body = { ok: false, message: e.message };
  }
});

apiRouter.post('/clients', async (ctx) => {
  const { name, domain, defaultCreds } = ctx.request.body;
  if (name && domain && defaultCreds) {
    try {
      await Client.create({ name, domain, defaultCreds });
      ctx.body = { ok: true };
    } catch (e) {
      ctx.status = 503;
      ctx.body = { ok: false, message: e.message };
    }
  } else {
    ctx.status = 503;
    ctx.body = { ok: false, message: 'Missing parameters' };
  }
});

apiRouter.get('/clients/:id', async (ctx) => {
  try {
    const data = await Client.findOne({ _id: ctx.params.id });
    ctx.body = { ok: true, data };
  } catch (e) {
    ctx.status = 503;
    ctx.body = { ok: false, message: e.message };
  }
});

apiRouter.del('/clients/:id', async (ctx) => {
  try {
    await Client.findByIdAndRemove(ctx.params.id);
    ctx.body = { ok: true };
  } catch (e) {
    ctx.status = 503;
    ctx.body = { ok: false, message: e.message };
  }
});

apiRouter.put('/clients/:id', async (ctx) => {
  const { name, domain, defaultCreds } = ctx.request.body;
  try {
    await Client.findByIdAndUpdate(ctx.params.id, { name, domain, defaultCreds });
    ctx.body = { ok: true };
  } catch (e) {
    ctx.status = 503;
    ctx.body = { ok: false, message: e.message };
  }
});

/**
 * Users
 */

apiRouter.post('/users/login', async (ctx) => {
  const { username, password } = ctx.request.body;
  const user = await auth.authenticate(username, password);
  if (user.error) {
    ctx.status = 401;
    ctx.body = { ok: false, message: user.error };
  } else {
    const token = jwt.sign({ data: user }, 'twoseventythree tomato sauce', { expiresIn: '4h' });
    ctx.body = { ok: true, jwt: token };
  }
});

apiRouter.post('/users', async (ctx) => {
  const { fullName, username, password, isAdmin } = ctx.request.body;
  try {
    await auth.register({ fullName, username, password, isAdmin });
    ctx.body = { ok: true };
  } catch (e) {
    ctx.status = 503;
    ctx.body = { ok: false, message: e.message };
  }
});

export default apiRouter;
