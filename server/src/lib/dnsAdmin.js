import readline from 'readline';
import inquirer from 'inquirer';
import auth from '../auth';
import connectDatabase from '../data/db';

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost/nautilus2';

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

const close = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Press any key to continue...', () => {
    rl.close();
    process.exit();
  });
};

inquirer.prompt(questions).then(async (answers) => {
  try {
    await connectDatabase(mongoUri);
  } catch (e) {
    console.log('Couldn\'t connect to database :(');
    close();
  }
  const payload = {
    username: answers.username,
    password: answers.password,
  };
  try {
    await auth.registerDNSUser(payload);
    console.log('Done!');
    close();
  } catch (e) {
    console.log(e);
    close();
  }
});
