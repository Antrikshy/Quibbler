var plan = require('flightplan');
 
plan.target('production', [
  {
    host: '',
    username: 'antrikshy',
    agent: process.env.SSH_AUTH_SOCK
  },
]);

// run commands on the target's remote hosts 
plan.remote(function(remote) {
  remote.with('cd quibbler', function() {
    remote.log('Pulling from git');
    remote.exec('git pull origin master');

    remote.log('Installing dependencies');
    remote.exec('npm install');

    remote.log('Restarting Quibbler');
    remote.sudo('restart quibbler', {user: 'antrikshy'});
  });
});
