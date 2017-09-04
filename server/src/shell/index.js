import { spawn } from 'child_process';
import path from 'path';
import pino from '../lib/logger';

const PSDIR = process.env.PSDIR;
pino.debug({ PSDIR }, 'PowerShell directory set');

const init = (ps, socket, connectionInfo) => {
  pino.debug(connectionInfo, 'Starting a new PowerShell session');
  socket.send('Please wait while I connect you to Office 365...');
  let params;
  if (!connectionInfo.defaultCreds) {
    params = `-Domain ${connectionInfo.domain} -adminUsername ${connectionInfo.username} -adminPassword ${connectionInfo.password}`;
  } else {
    params = `-Domain ${connectionInfo.domain}`;
  }
  const initCmd = `& '${path.resolve(PSDIR, '_launcher_specified.ps1')}' ${params}`;
  ps.stdin.write(initCmd);
  ps.stdin.write('\r\n');
};

const handleCommand = (ps, socket, command) => {
  pino.debug({ command }, 'Received a PowerShell command');
  if (command === 'exit') {
    socket.send('exit');
    ps.stdin.write('exit\r\n');
  } else {
    // deal with sending the command to powershell
    ps.stdin.write(`${command}\r\n`);
  }
};

export default (ctx) => {
  pino.debug(ctx, 'New WebSocket connection initiated');
  // if (!psdir) throw new Error('PowerShell directory required');
  const args = [
    '-NoLogo',
    '-NoExit',
    '-InputFormat',
    'Text',
    '-ExecutionPolicy',
    'Unrestricted',
    '-Command',
    '-'];
  const ps = spawn('powershell', args);

  ctx.websocket.on('message', (message) => {
    const msg = JSON.parse(message);
    switch (msg.type) {
      case 'init':
        init(ps, ctx.websocket, msg.data);
        break;
      case 'command':
        handleCommand(ps, ctx.websocket, msg.data);
        break;
      default:
        break;
    }
  });

  // deal with receiving output from powershell and sending it to socket
  let outputBuffs = [];
  ps.stdout.on('data', (chunk) => {
    if (chunk.toString().indexOf('###') !== -1) { // listen for an End-of-Output token
      const htmlizedOutput = Buffer.concat(outputBuffs).toString().replace(/[\n\r]/img, '<br>');
      ctx.websocket.send('commandResponse', htmlizedOutput);
      outputBuffs = [];
    } else {
      outputBuffs.push(chunk);
    }
  });

  ctx.websocket.on('close', () => {
    pino.debug(ctx, 'Closing WebSocket session');
    // wait for PSSession to close out, then kill PS
    setTimeout(() => {
      pino.debug('Killing PowerShell');
      ps.kill();
    }, 2000);
  });
};
