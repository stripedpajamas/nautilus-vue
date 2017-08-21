import Pino from 'pino';

const level = process.env.DEBUG ? 'debug' : 'info';

export default new Pino({
  level,
});
