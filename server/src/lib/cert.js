import greenlock from 'greenlock-express';
import path from 'path';
import os from 'os';

const domains = ['nautilus.quo.cc'];

// Let's Encrypt
const le = greenlock.create({
  server: 'staging', // in production use 'https://acme-v01.api.letsencrypt.org/directory'
  configDir: path.resolve(os.homedir(), 'letsencrypt', 'etc'),
  approveDomains: (opts, certs, cb) => {
    const options = opts;
    options.domains = (certs && certs.altnames) || opts.domains;
    options.email = 'peter.j.squicciarini@gmail.com';
    options.agreeTos = true;

    if (options.domains.some(domain => domains.includes(domain))) {
      return cb(null, { options, certs });
    }
    return cb('Not an approved domain');
  },
});

export default le;
