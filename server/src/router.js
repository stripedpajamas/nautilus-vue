import Router from 'koa-better-router';
import jwt from 'jsonwebtoken';
import duo from 'duo_web';
import pino from './lib/logger';
import ps from './shell';
import dns from './shell/dns';
import User from './data/models/User';
import DNSUser from './data/models/DNSUser';
import Client from './data/models/Client';
import DuoData from './data/models/Duo';
import auth from './auth';

const jwtSecret = process.env.JWT_SECRET || 'twoseventythree tomato sauce';
const companyId = process.env.COMPANY_ID || 'qv';

/**
 * Router for the API
 */
const apiRouter = Router({ prefix: '/api' }).loadMethods();
const dnsRouter = Router({ prefix: '/dns' }).loadMethods();
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
    pino.error({ ctx, error: e.message }, 'Failed to retrieve client list from database');
    ctx.status = 503;
    ctx.body = { ok: false, message: e.message };
  }
});

apiRouter.post('/clients', async (ctx) => {
  pino.debug(ctx, 'Clients endpoint posted to');
  const { name, domain, defaultCreds, includeExpireCheck, includeLicenseCheck } = ctx.request.body;
  if (name && domain && [defaultCreds, includeExpireCheck, includeLicenseCheck].every(bool => typeof bool !== 'undefined')) {
    try {
      await Client.create({ name, domain, defaultCreds, includeExpireCheck, includeLicenseCheck });
      pino.info({ name, domain, defaultCreds, includeExpireCheck, includeLicenseCheck }, 'Added new client to MongoDB');
      ctx.body = { ok: true };
    } catch (e) {
      pino.error({
        ctx,
        name,
        domain,
        defaultCreds,
        includeExpireCheck,
        includeLicenseCheck,
        error: e.message,
      }, 'Failed to add new client to MongoDB');
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
    pino.error({ ctx, id: ctx.params.id, error: e.message }, 'Failed to retrieve client info from database');
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
    pino.error({ ctx, id: ctx.params.id, error: e.message }, 'Failed to delete client');
    ctx.status = 503;
    ctx.body = { ok: false, message: e.message };
  }
});

apiRouter.put('/clients/:id', async (ctx) => {
  pino.debug(ctx, 'Edit specific client id endpoint requested');
  const { name, domain, defaultCreds, includeExpireCheck, includeLicenseCheck } = ctx.request.body;
  try {
    await Client.findByIdAndUpdate(ctx.params.id, {
      name,
      domain,
      defaultCreds,
      includeExpireCheck,
      includeLicenseCheck,
    });
    pino.info({
      id: ctx.params.id,
      name,
      domain,
      defaultCreds,
      includeExpireCheck,
      includeLicenseCheck,
    }, 'Client edited successfully');
    ctx.body = { ok: true };
  } catch (e) {
    pino.error({ ctx, id: ctx.params.id, error: e.message }, 'Failed to edit client');
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
    pino.info(user, 'User authenticated successfully, sending Duo prompt');
    return DuoData.findOne({ companyId })
      .then((data) => {
        const { ikey, skey, akey, api } = data.data;
        const signedReq = duo.sign_request(ikey, skey, akey, user.username);
        ctx.body = { ok: true, signedReq, api };
      })
      .catch((e) => {
        pino.error('Failed to load Duo data');
        ctx.status = 503;
        ctx.body = { ok: false, message: e.message };
      });
  }
});

apiRouter.post('/users/login/duo', (ctx, next) => {
  // this endpoint should receive the response after Duo 2FA
  // it will be the one to issue the jwt
  const sr = ctx.request.body.signedRes;
  if (sr) {
    pino.debug({ sr }, 'Received signed response from client');
    return DuoData.findOne({ companyId })
      .then((duoData) => {
        const { ikey, skey, akey } = duoData.data;
        pino.debug({ ikey, skey, akey }, 'Found Duo info in DB');
        const authenticatedUsername = duo.verify_response(ikey, skey, akey, sr);
        pino.info({ authenticatedUsername }, 'Duo verified the response and gave us a username');
        if (authenticatedUsername) {
          return User.findOne({ username: authenticatedUsername })
            .then((user) => {
              if (user) {
                pino.debug({ user }, 'Found user in DB');
                const { fullName, username, isAdmin, _id } = user;
                const data = { fullName, username, isAdmin, _id };
                const token = jwt.sign({ data }, jwtSecret, { expiresIn: '4h' });
                pino.debug({ token }, 'Sending JWT to client');
                ctx.body = { ok: true, jwt: token };
              }
            });
        }
        ctx.status = 401;
        ctx.body = { ok: false, message: 'Authentication failed' };
        return next();
      })
      .catch((e) => {
        pino.error('DB lookup failed for Duo or User');
        ctx.status = 503;
        ctx.body = { ok: false, message: e.message };
      });
  }
  ctx.body = 401;
  ctx.body = { ok: false, message: 'Invalid Duo Response' };
  return next();
});

apiRouter.get('/users', async (ctx) => {
  pino.debug(ctx, 'Users list endpoint requested');
  try {
    const data = await User.find({}, 'fullName username isAdmin');
    pino.debug(data, 'User list retrieved');
    ctx.body = { ok: true, data };
  } catch (e) {
    pino.error({ ctx, error: e.message }, 'Failed to retrieve user list');
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
    pino.error({ ctx, fullName, username, isAdmin, error: e.message }, 'Failed to add user');
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
    pino.error({ ctx, id: ctx.params.id, error: e.message }, 'Failed to delete user');
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
      pino.error({ ctx, id: ctx.params.id, error: e.message }, 'Failed to edit user');
      ctx.status = 503;
      ctx.body = { ok: false, message: e.message };
    });
});

/**
 * DNS Users
 */
apiRouter.get('/users/dns', async (ctx) => {
  pino.debug(ctx, 'DNS Users list endpoint requested');
  try {
    const data = await DNSUser.find({}, 'company username');
    pino.debug(data, 'DNS User list retrieved');
    ctx.body = { ok: true, data };
  } catch (e) {
    pino.error({ ctx, error: e.message }, 'Failed to retrieve DNS user list');
    ctx.status = 503;
    ctx.body = { ok: false, message: e.message };
  }
});

apiRouter.post('/users/dns', async (ctx) => {
  pino.debug(ctx, 'Register new DNS user endpoint requested');
  const { company, username, password } = ctx.request.body;
  try {
    await auth.registerDNSUser({ company, username, password });
    pino.info({ company, username }, 'DNS User added successfully');
    ctx.body = { ok: true };
  } catch (e) {
    pino.error({ ctx, company, username, error: e.message }, 'Failed to add DNS user');
    ctx.status = 503;
    ctx.body = { ok: false, message: e.message };
  }
});

apiRouter.del('/users/dns/:id', async (ctx) => {
  pino.debug(ctx, 'Delete DNS user endpoint requested');
  try {
    await DNSUser.findByIdAndRemove(ctx.params.id);
    pino.info({ id: ctx.params.id }, 'DNS User deleted successfully');
    ctx.body = { ok: true };
  } catch (e) {
    pino.error({ ctx, id: ctx.params.id, error: e.message }, 'Failed to delete DNS user');
    ctx.status = 503;
    ctx.body = { ok: false, message: e.message };
  }
});

apiRouter.put('/users/dns/:id', async (ctx) => {
  pino.debug(ctx, 'Edit DNS user endpoint requested');
  const { company, username, password } = ctx.request.body;
  return DNSUser.findById(ctx.params.id)
      .then((u) => {
        pino.debug({ id: ctx.params.id }, 'Found DNS user to edit in database');
        const user = u;
        user.username = username;
        user.company = company;
        if (password) {
          pino.debug({ id: ctx.params.id }, 'Password change requested for this DNS user');
          user.password = password;
        }
        return user.save()
          .then(() => {
            pino.info({ company, username, id: ctx.params.id }, 'Successfully edited DNS user');
            ctx.body = { ok: true };
          });
      })
    .catch((e) => {
      pino.error({ ctx, id: ctx.params.id, error: e.message }, 'Failed to edit DNS user');
      ctx.status = 503;
      ctx.body = { ok: false, message: e.message };
    });
});

/**
 * DNS Tasks
 */
dnsRouter.get('/ip', async (ctx) => {
  pino.debug(ctx, 'DNS IP endpoint requested');
  ctx.body = { ip: ctx.request.ip };
});
dnsRouter.post('/update', async (ctx) => {
  pino.debug(ctx, 'DNS update endpoint requested');
  const { username, password, ip } = ctx.request.body;
  // first see if this is a good IP address
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ip)) {
    ctx.body = { ok: false, message: 'Invalid IP address' };
  } else {
    const user = await auth.authenticateDNSUser(username, password);
    if (user.error) {
      pino.warn(user, 'User authentication failed');
      ctx.status = 401;
      ctx.body = { ok: false, message: user.error };
    } else {
      pino.info(user, 'User authenticated successfully, updating DNS');
      dns.update(username, ip);
      ctx.body = { ok: true };
    }
  }
});

export {
  apiRouter,
  dnsRouter,
  wsRouter,
};
