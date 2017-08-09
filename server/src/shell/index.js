import { spawn } from 'child_process';
import path from 'path';

const PSDIR = process.env.PSDIR;

const init = (socket, connectionInfo) => {
  socket.send('Please wait while I connect you to Office 365...');
  let params;
  if (!connectionInfo.defaultCreds) {
    params = `-Domain ${connectionInfo.domain} -adminUsername ${connectionInfo.username} -adminPassword ${connectionInfo.password}`;
  } else {
    params = `-Domain ${connectionInfo.domain}`;
  }
  // const initCmd = `& '${path.resolve(psdir, '_launcher_specified.ps1')}' ${params}`;
  // ps.stdin.write(initCmd);
  // ps.stdin.write('\r\n');
};

const handleCommand = (socket, command) => {
  console.log(command);
  if (command === 'exit') {
    socket.send('exit');
    // ps.stdin.write('exit\r\n');
  } else {
    // deal with sending the command to powershell
    // ps.stdin.write(`${command}\r\n`);
  }
};

export default (ctx) => {
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
  // const ps = spawn('powershell', args);

  ctx.websocket.on('message', (message) => {
    const msg = JSON.parse(message);
    switch (msg.type) {
      case 'init':
        init(ctx.websocket, msg.data);
        break;
      case 'command':
        handleCommand(ctx.websocket, msg.data);
        break;
      default:
        break;
    }
  });

  // deal with receiving output from powershell and sending it to socket
  // let outputBuffs = [];
  // ps.stdout.on('data', (chunk) => {
  //   if (chunk.toString().indexOf('###') !== -1) { // listen for an End-of-Output token
  //     const htmlizedOutput = Buffer.concat(outputBuffs).toString().replace(/[\n\r]/img, '<br>');
  //     ctx.message.send('commandResponse', htmlizedOutput);
  //     outputBuffs = [];
  //   } else {
  //     outputBuffs.push(chunk);
  //   }
  // });

  ctx.websocket.on('close', () => {
    // wait for PSSession to close out, then kill PS
    setTimeout(() => {
      console.log('KILLED');
      // ps.kill();
    }, 2000);
  });
};
