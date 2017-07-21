const Router = require('koa-better-router');

/**
 * Router for the API
 */
const apiRouter = Router({ prefix: '/api' }).loadMethods();

apiRouter.get('/', (ctx, next) => {
  ctx.body = 'Hello world. You da best.';
  return next();
});

module.exports = apiRouter;
