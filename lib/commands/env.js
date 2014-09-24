var fs = require('fs');
var regular = require('regular');
var format = require('chalk');
var _ = require('lodash');
var util = require('util');

module.exports = function (cli) {
  function withApp(callback) {
    return function (environment, done) {
      environment = process.argv[3];
      
      callback(cli.api.apps.id(cli.cwd.getConfig().name), environment, done);      
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

  // // Config
  // command.task('config <environment> <options ...>')
  //   .description('configure your app\'s environment')
  //   .handler(withApp(function (app, environment, done) {
  //     console.log('config');
  //     done();
  //   }));
  
  // Create
  command.task('create <environment>')
    .description('create a custom-named environment')
    .handler(withApp(function(app, environment, done) {
      var endpoint = app.endpoint('env').one(environment);
      endpoint.http.request(endpoint.url(), 'PUT', function(err, response) {
        if (err) return done(err.message);
        if (response.statusCode !== 200) {
          done(response.message);
        }
        else {
          cli.log('Created environment ' + environment);
          done();
        }
      });
    }));
  
  // Delete
  command.task('delete <environment>')
    .description('delete a named environment')
    .handler(withApp(function(app, environment, done) {
      var endpoint = app.endpoint('env').one(environment);
      endpoint.http.request(endpoint.url(), 'DELETE', function(err, response) {
        if(err) return done(err.message);
        if (response.statusCode !== 200) {
          done(response.message);
        }
        else {
          cli.log('Deleted environment ' + environment);
          done();
        }
      });
    }));
  
  // Pull
  command.task('pull <environment>')
    .description('copy environment data to your local environment')
    .handler(withApp(function (app, environment, done) {
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
  
  // Add
  command.task('add <environment> KEY=value KEY2=value ...')
    .description('add environment data')
    .handler(withApp(function (app, environment, done) {
      var vars = {};
      var match;
      
      cli.args.args.forEach(function(arg) {
        match = arg.match(/([\w_-]+)=(.*)?/)
        if (match) {
          vars[match[1]] = arg.slice(match[1].length + 1);
        }
      });

      app.env(environment).config({ env: vars }, function(err, response) {
        cli.log();
        
        if (err) return done(cli.errors.DEFAULT);
        if (response.statusCode == 400) return done(cli.errors.MUST_HAVE_DEPLOYED_APP);
        if (response.statusCode !== +200) return done(cli.errors.DEFAULT);
        
        cli.log(format.bold(environment) + ' has been configured..', {success: true});
        
        Object.keys(vars).forEach(function(variable) {
          cli.log(variable, {success: true});
        });
        
        done(err, response);
      });
    }));
};
