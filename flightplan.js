var plan = require('flightplan');
 
plan.target('production', [
  {
    host: '192.241.193.143',
    username: 'antrikshy',
    agent: process.env.SSH_AUTH_SOCK
  },
]);

plan.local(function(local) {
  local.log('Pushing to GitHub');
  local.exec('git push origin master');
});

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
