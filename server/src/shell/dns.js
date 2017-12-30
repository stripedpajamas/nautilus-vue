import { spawn } from 'child_process';
import path from 'path';
import pino from '../lib/logger';

const PSDIR = process.env.PSDIR;
pino.debug({ PSDIR }, 'PowerShell directory set (for DNS)');

export default {
  update(hostname, ip) {
    pino.debug('Starting Powershell for DNS update');
    const params = `-RecordName ${hostname} -NewIP ${ip}`;
    const cmd = `& '${path.resolve(PSDIR, 'dnsUpdate.ps1')}' ${params}`;
    const args = [
      '-NoLogo',
      '-NoProfile',
      '-ExecutionPolicy',
      'Unrestricted',
      '-Command',
      cmd,
    ];
    const ps = spawn('powershell', args);
    ps.stdout.on('data', (err) => {
      // some kind of output would mean an error most likely (since we try/catch within PS)
      pino.warn(err, 'Output of DNS update command');
    });
    ps.stderr.on('data', (err) => {
      pino.error(err, 'Error in DNS update command');
    });
    ps.on('close', (code) => {
      pino.debug(`DNS Updater exited with code ${code}`);
    });
  },
};
