var regular = require('regular');
var format = require('chalk');
var _ = require('lodash');

module.exports = function (cli) {
  function withApp(callback) {
    return function (environment, done) {
      environment = process.argv[3];

      if (!environment) return done(cli.errors.MISSING_ENVIRONMENT);

      cli.commands.apps(function (err, apps) {
        var name = cli.cwd.getConfig().name;
        var appObj = _.find(apps.self, function (app) {
          return app.name === name;
        });

        if (!appObj) return done('The app ' + format.bold(name) + ' does not exist');

        callback(cli.api.apps.id(appObj.name), environment, done);      
      });
    }
  }

  var command = cli.command('env <environment>');
  command.before('authenticate');
  command.description('add/remove environment variables');
  command.handler(withApp(function (app, environment, done) {
    // app.endpoint('env').one(environment).get(function(err, response) {
    //   if (err || response.statusCode !== +200) return done(cli.errors.DEFAULT);
    //   console.log(response);
    // });
  }));

  var pull = command.task('pull <environment>');
  var add = command.task('add <environment> KEY=value KEY2=value ...');

  pull.description('copy environment data to your local environment');
  pull.handler(withApp(function (app, environment, done) {
    // cli.api._api._request(path, method, options, callback);
    console.log("env:pull");
  }));

  add.description('add environment data');
  add.handler(withApp(function (app, environment, done) {
    var vars = {};
    var match;
    
    process.argv.forEach(function(arg) {
      match = arg.match(/([\w_-]+)=(.*)/)
      if (match) {
        vars[match[1]] = match[2];
      }
    });

    app.env(environment).config({ env: vars }, function(err, response) {
      if (err || response.statusCode !== +200) return done(cli.errors.DEFAULT);
        
      cli.log(format.bold(environment) + ' has been configured..', {success: true});
      Object.keys(vars).forEach(function(variable) {
        cli.log(variable, {success: true});
      });
      done(err, response);
    });
  }));
};