var regular = require('regular');
var format = require('chalk');
var _ = require('lodash');
var fs = require('fs');
var util = require('util');

module.exports = function (cli) {
  function withApp(callback) {
    return function (environment, done) {
      environment = process.argv[3];

      if (!environment) return done(cli.errors.MISSING_ENVIRONMENT);

      cli.commands.apps(function (err, apps) {
        var name = cli.cwd.getConfig().name;
        var appObj;
        
        _.each(apps, function (orgApps) {
          var app = _.find(orgApps, function (app) {
            return app.name === name;
          });
          
          if (app) appObj = app;
        });
        
        if (!appObj) return done('You do not have access to the app ' + name);

        callback(cli.api.apps.id(appObj.name), environment, done);      
      });
    }
  }

  var command = cli.command('env');
  command.before('authenticate');
  command.description('work with environment variables');
  command.handler(withApp(function (app, environment, done) {
    app.endpoint('env').one(environment + '/config').get(function(err, response) {
      if (err) return done(cli.errors.DEFAULT);
      if (_.isEqual(response, {})) {
        cli.log(format.bold(environment) + ' does not have any environment variables');
        return done();
      }
      
      cli.log()
      cli.logObject(response);
      done(null, response);
    });
  }));

  var pull = command.task('pull <environment>');
  var add = command.task('add <environment> KEY=value KEY2=value ...');

  pull.description('copy environment data to your local environment');
  pull.handler(withApp(function (app, environment, done) {
    app.endpoint('env').one(environment + '/config').get(function(err, response) {
      if (err) return done(cli.errors.DEFAULT);

      try {
        var currentConfig = JSON.parse(fs.readFileSync('./.env.json'));
      }
      catch (error) {
        var currentConfig = {};
      }

      var skipped = {};

      Object.keys(response).forEach(function (key) {
        if (currentConfig[key]) {
          if (currentConfig[key] != response[key])  {  
            skipped[key] = response[key];
          }
          return;
        }
        currentConfig[key] = response[key];
      });

      if (_.any(skipped)) {
        cli.log('Skipping values that would clobber environment on disk!', {warning: true});
        Object.keys(skipped).forEach(function (key) {
          cli.log(key.bold + ': ' + skipped[key]);
        });

      }

      fs.writeFileSync('./.env.json', JSON.stringify(currentConfig, null, 2));
      cli.log('Wrote config to .env.json', {success: true});
      done(err, response);
    });
  }));

  add.description('add environment data');
  add.handler(withApp(function (app, environment, done) {
    var vars = {};
    var match;
    
    cli.args.args.forEach(function(arg) {
      match = arg.match(/([\w_-]+)=(.*)?/)
      if (match) {
        vars[match[1]] = arg.slice(match[1].length + 1);
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