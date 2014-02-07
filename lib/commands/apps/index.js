var format = require('chalk');

exports.description = 'list your apps';

exports.require = ['authenticate', 'config'];

exports.register = function () {  
  var command = this;
  
  command.api.apps.list(function (err, apps) {
    command.update();
    
    if (apps && apps.error === 'invalid_token') return command.error(command.errors.INVALID_TOKEN);
    if (apps && apps.error) return command.error(apps.error);
    if (!apps || !apps.self) return command.error(command.errors.DEFAULT);
    
    command.update(format.blue('=== your apps ===\n'));
    
    apps.self.forEach(function (app) {
      command.update('  ' + app.name);
    });
    
    for (group in apps) {
      if (group === 'self' || apps[group].length === 0) { continue; }
      if (!apps[group]) { continue; }
      
      command.update('\n' + format.blue('=== ' + group.replace('org:', '') + ' apps ===\n'));
      
      apps[group].self.forEach(function (app) {
        command.update('  ' + app.name);
      });
    }
    
    command.done(err, apps);
  });  
};