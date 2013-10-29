var prettyPrint = require('./helpers/pretty_print');

var config = function (app) {
  app.program
    .command('config')
    .description('list config file values')
    .action(function () {
      app.logger.writeln();
      app.logger.info('Divshot.io'.blue + ' config file values')
      app.logger.writeln();
      
      prettyPrint.object(app, app.cwd.getConfig());
    });
  
  add(app);
  remove(app);
};

function add (app) {
  app.program
    .command('config:add [key] [value]')
    .description('add value to the config file')
    .action(function (key, value) {
      if (!key || !value) return app.logger.error('Config key and value is required: ' + 'divshot config:add [key] [value]'.bold);
      
      app.cwd.setConfigValue(key, value);
      app.logger.success(key.bold + ' set to ' + value.bold);
    });
}

function remove (app) {
  app.program
    .command('config:remove [key]')
    .description('edit the conifg file')
    .action(function (value) {
      if (!value) return app.logger.error('Config value is required: ' + 'divshot config:remove [value]'.bold);
      
      app.cwd.removeConfigValue(value);
      app.logger.success(value.bold + ' removed');
    });
}

module.exports = config;