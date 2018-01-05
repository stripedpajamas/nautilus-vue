import readline from 'readline';
import inquirer from 'inquirer';
import auth from '../auth';

const questions = [
  {
    type: 'input',
    name: 'username',
    message: 'New DNS Username (this will be the hostname):',
  },
  {
    type: 'password',
    name: 'password',
    message: 'New DNS Password:',
  },
];

inquirer.prompt(questions).then(async (answers) => {
  const payload = {
    username: answers.username,
    password: answers.password,
  };
  try {
    await auth.registerDNSUser(payload);
    console.log('Done!');
  } catch (e) {
    console.log(e);
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Press any key to continue...', () => {
    rl.close();
    process.exit();
  });
});
