var _ = require('lodash');
var format = require('chalk');
var regular = require('regular');
var inquirer = require('inquirer');

module.exports = function (cli) {
  
  var hooks = cli.command('hooks')
    .description('get a list of webhooks for your app')
    .before('isApp', 'authenticate')
    .handler(listHooks);
  
  hooks.task('add <url>')
    .description('add a webhook to your app')
    .handler(addHook);
  
  hooks.task('remove <OPTIONAL url>')
    .description('remove a webhook from your app')
    .handler(removeHook);
  
  hooks.task('pause <OPTIONAL url>')
    .description('deactivate a webhook without removing it')
    .handler(activateHook(false));
  
  hooks.task('resume <OPTIONAL url>')
    .description('reactivate a paused webhook')
    .handler(activateHook(true));
  
  function listHooks (done) {
    
    var localApp = cli.cwd.getConfig();
    var app = cli.api.apps.id(localApp.name);
    
    app.webhooks.list(function (err, hooks) {
      
      if (err) {
        return done(err.message);
      }
      
      if (hooks.length < 1) {
        cli.log('\nYour app doesn\'t have any webhooks yet. Use ' + format.bold('divshot hooks:add <url>') + ' to an a webhook.');
      }
      
      var active = sortHooks(hooks, 'active');
      var inactive = sortHooks(hooks, 'inactive');
      
      cli.log();
      
      cli.logObject(hooks.map(describeHook), {
        leftPadding: 2
      });
    });
  }
  
  function addHook (url, done) {
        
    cli.log();
    
    if (!regular.url.test(url)) {
      done(cli.errors.INVALID_URL);
    }
    
    var localApp = cli.cwd.getConfig();
    
    cli.api.apps.id(localApp.name).webhooks.create({
      url: url,
      active: true
    }, function (err, response) {
      
      if (err) {
        done(err.message);
      }
      
      if (response.error) {
        return done(response.error);
      }
      
      cli.log('The webhook ' + format.bold(url) + ' has been added and activated', {success: true});
    });
  }
  
  function removeHook (url, done) {
        
    var localApp = cli.cwd.getConfig();
    var appHooks = cli.api.apps.id(localApp.name).webhooks;
    
    appHooks.list(function (err, hooks) {
      
      cli.log();
      
      if (err) {
        return done(err.message);
      }
      
      if (hooks.error) {
        return done(hooks.error);
      }
      
      if (hooks.length < 1) {
        cli.log('Your app does not have any webhooks.');
        return;
      }
      
      // User provided a url in the command call, so it
      // gets removed here
      if (url) {
        return removeHook(hooks, url);
      }
      
      // Ask user to choose a webhook from a list if the user
      // doesn't provide a url in the command call
      else {
        inquirer.prompt({
          type: 'list',
          name: 'hook',
          message: 'Which hook would you like to remove?',
          choices: _.pluck(hooks, 'url')
        }, function(answer) {
            
            removeHook(hooks, answer.hook);
        });
      }
    });
    
    function removeHook (hooks, url) {
      
      var hook = _.find(hooks, function (hook) {
        
        return hook.url === url;
      });
      
      if (!hook) {
        return done(cli.errors.INVALID_HOOK_ID);
      }
      
      cli.log('Removing webhook ...');
      
      appHooks.remove(hook.id, function (err, response) {
        
        cli.log();
        
        if (err) {
          return done(err.message);
        }
        
        if (response.statusCode !== 204) {
          return done(cli.errors.INVALID_HOOK_ID);
        }
        
        cli.log(format.bold(url) + ' has been removed.', {success: true});
      });
    }
  }
  
  function activateHook (shouldActivate) {
    
    var activationVerb = shouldActivate ? 'Resuming' : 'Pausing';
    var activationAction = shouldActivate ? 'resume': 'pause';
    
    return function (url, done) {
          
      var localApp = cli.cwd.getConfig();
      var appHooks = cli.api.apps.id(localApp.name).webhooks;
      
      appHooks.list(function (err, hooks) {
        
        cli.log();
        
        if (err) {
          return done(err.message);
        }
        
        if (hooks.error) {
          return done(hooks.error);
        }
        
        if (hooks.length < 1) {
          cli.log('Your app does not have any webhooks.');
          return;
        }
        
        // User provided a url in the command call, so it
        // gets removed here
        if (url) {
          return handleActivation(hooks, url);
        }
        
        // Ask user to choose a webhook from a list if the user
        // doesn't provide a url in the command call
        else {
          inquirer.prompt({
            type: 'list',
            name: 'hook',
            message: 'Which hook would you like to ' + activationAction + '?',
            choices: _.pluck(hooks, 'url')
          }, function(answer) {
              
              handleActivation(hooks, answer.hook);
          });
        }
      });

      function handleActivation (hooks, url) {
        
        var hook = _.find(hooks, function (hook) {
          
          return hook.url === url;
        });
        
        if (!hook) {
          return done(cli.errors.INVALID_HOOK_ID);
        }
        
        cli.log(activationVerb  + ' webhook ...');
        
        appHooks[activationAction](hook, function (err, hook) {
          
          cli.log();
          
          if (err) {
            return done(err.message);
          }
          
          if (hook.statusCode) {
            return done(cli.errors.INVALID_HOOK_ID);
          }
          
          cli.log(format.bold(url) + ' has been ' + activationAction + 'd.', {success: true});
        });
      }
    }
  }
  
};

function sortHooks (hooks, status) {
  
  return _(hooks)
    .filter({active: (status === 'active') ? true : false})
    .map(describeHook)
    .value();
}

function describeHook (hook) {
          
  var desc = hook.url;
  
  if (!hook.active) {
    desc += ' (inactive)';
  }
  
  return desc;
}