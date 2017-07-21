const Koa = require('koa');
const serve = require('koa-static');
const path = require('path');
const router = require('./router');

const app = new Koa();

/**
 * Load the routes from router.js
 */
app.use(router.middleware());

/**
 * Serve the Vue app from the dist/ folder
 */
app.use(serve(path.resolve(__dirname, '../dist')));

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
