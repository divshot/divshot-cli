var _ = require('lodash');
var request = require('request');
var marked = require('marked');
var TerminalRenderer = require('marked-terminal');
var format = require('chalk');

module.exports = function (cli) {
  var changelog = cli.command('changelog')
    .description('view info for the latest changes the the Divshot cli')
    .handler(function (done) {
      
      // Define custom renderer
      marked.setOptions({
        renderer: new TerminalRenderer()
      });
      
      var requestOptions = {
        uri: 'https://api.github.com/repos/divshot/divshot-cli/releases',
        method: 'GET',
        headers: {'user-agent': 'node.js'}
      };
      
      request(requestOptions, function (err, response, body) {
        
        var moar = require('moar')({nowrap: true});
        var releases = JSON.parse(body);
        
        _.each(releases, function (release) {
          
          var data = '\n\n' + format.bold[cli.color].underline('=== ' + release.name);
          
          data += '\n\n'
          data += marked(release.body);
          
          moar.write(data);
        });
        
        moar.end();
      });
    });
};