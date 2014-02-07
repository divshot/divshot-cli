var format = require('chalk');


  // command.flags(
  //   '-p, --port [port], the app port to serve files',
  //   '--host [host], the host of the app'
  // );

module.exports = function (cli) {
  var command =  cli.command('apps', 'a');
  
  command.before('authenticate');
  command.description('add and remove domains and list them and stuff');
  command.action(listApps);
  
  function listApps (done) {
    cli.api.apps.list(function (err, apps) {
      cli.log();
      
      if (apps && apps.error === 'invalid_token') return done(cli.errors.INVALID_TOKEN);
      if (apps && apps.error) return done(apps.error);
      if (!apps || !apps.self) return done(cli.errors.DEFAULT);
      
      cli.log(format.blue('=== your apps ===\n'));
      
      apps.self.forEach(function (app) {
        cli.log('  ' + app.name);
      });
      
      for (group in apps) {
        if (group === 'self' || apps[group].length === 0) { continue; }
        if (!apps[group]) { continue; }
        
        cli.log('\n' + format.blue('=== ' + group.replace('org:', '') + ' apps ===\n'));
        
        apps[group].self.forEach(function (app) {
          cli.log('  ' + app.name);
        });
      }
      
      done(err, apps);
    });
  }
};










// exports.command = 'apps'; // or ['app', 'a']
// exports.flags = {
//   '-p': 'port',
//   '--port': 'port'
// };
// exports.description = 'list your apps';
// exports.require = ['authenticate', 'config'];

// exports.register = function () {  
//   var command = this;
  
//   command.api.apps.list(function (err, apps) {
//     command.update();
    
//     if (apps && apps.error === 'invalid_token') return command.error(command.errors.INVALID_TOKEN);
//     if (apps && apps.error) return command.error(apps.error);
//     if (!apps || !apps.self) return command.error(command.errors.DEFAULT);
    
//     command.update(format.blue('=== your apps ===\n'));
    
//     apps.self.forEach(function (app) {
//       command.update('  ' + app.name);
//     });
    
//     for (group in apps) {
//       if (group === 'self' || apps[group].length === 0) { continue; }
//       if (!apps[group]) { continue; }
      
//       command.update('\n' + format.blue('=== ' + group.replace('org:', '') + ' apps ===\n'));
      
//       apps[group].self.forEach(function (app) {
//         command.update('  ' + app.name);
//       });
//     }
    
//     command.done(err, apps);
//   });  
// };