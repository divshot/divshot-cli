var _ = require('lodash');
var request = require('request');
var format = require('chalk');
var markdown = require('markdown');

module.exports = function (cli) {
//   var changelog = cli.command('changelog')
//     .description('view info for the latest changes the the Divshot cli')
//     .handler(function (done) {
//       var requestOptions = {
//         uri: 'https://api.github.com/repos/divshot/divshot-cli/releases',
//         method: 'GET',
//         headers: {'user-agent': 'node.js'}
//       };
      
//       // request(requestOptions, function (err, response, body) {
//         // if (response.statusCode !== 200) {}
        
        
//         // var releases = JSON.parse(body);
//         var releases = mockReleases();
        
//         releases.reverse().forEach(function (release) {
//           cli.log('\n');
//           cli.log(format[cli.color]('=== ' + release.name));
//           cli.log();
          
//           var tree = markdown.markdown.toHTML(release.body);
          
//           tree = tree
//             .replace(/<li>/gi, ' *  ')
//             .replace(/<\/li>/gi, '\n')
//             .replace(/<ul>/gi, '')
//             .replace(/<\/ul>/gi, '')
//             .replace(/<p>/gi, '')
//             .replace(/<\/p>/gi, '\n')
          
//           tree = tree.split('\n')
//             .filter(function (line) {
//               if (line !== '') return true;
//             })
//             .map(function (line) {
//               if (matches = line.match(/<strong>([^<]+)<\/strong>/i)) {
//                 return format.bold(matches[1]);
//               }
//               // else if (matches = line.replace(/[^<]*(<a href="([^"]+)">([^<]+)<\/a>)/i, '$3')) {
//                 // return matches;
//               // }
//               else {
//                 return line;
//               }
//             });
          
//           console.log(tree);
          
//           // _(tree)
//           //   .tail()
//           //   .each(parseNode);
          
//           // function parseNode (node) {
//           //   var attrs;
//           //   var textNodes = _.tail(node);
//           //   var wrapperTagName = node[0];
            
//           //   if (_.isObject(textNodes[0]) && !_.isArray(textNodes[0])) {
//           //     attrs = textNodes[0];
//           //     textNodes = _.tail(textNodes);
//           //   }
            
//           //   _(textNodes)
//           //     .each(function (node) {
//           //       if (typeof node === 'string') {
//           //         if (wrapperTagName === 'italic') node = format.italic(node);
//           //         if (wrapperTagName === 'strong') node = format.bold(node);
//           //         if (wrapperTagName === 'h1') node = format.bold(node);
//           //         if (wrapperTagName === 'h2') node = format.bold(node);
//           //         if (wrapperTagName === 'h3') node = format.bold(node);
//           //         if (wrapperTagName === 'h4') node = format.bold(node);
//           //         if (wrapperTagName === 'h5') node = format.bold(node);
//           //         if (wrapperTagName === 'h6') node = format.bold(node);
                  
//           //         process.stdout.write(node);
//           //       }
                
//           //       if (_.isObject(node)) {
//           //         parseNode(node);
//           //       }
//           //     });
            
//           //   if (wrapperTagName === 'p') cli.log('\n');
//           // }
          
//           // cli.log();
//         });
//       // });
      
//     });

//   changelog.task('open')
//     .description('open the changelog on Github')
//     .handler(function () {
//       console.log('open');
//     });
// };

// function mockReleases () {
//   return [ { url: 'https://api.github.com/repos/divshot/divshot-cli/releases/318945',
//     assets_url: 'https://api.github.com/repos/divshot/divshot-cli/releases/318945/assets',
//     upload_url: 'https://uploads.github.com/repos/divshot/divshot-cli/releases/318945/assets{?name}',
//     html_url: 'https://github.com/divshot/divshot-cli/releases/tag/0.10.0',
//     id: 318945,
//     tag_name: '0.10.0',
//     target_commitish: 'master',
//     name: '0.10.0',
//     draft: false,
//     author:
//      { login: 'scottcorgan',
//        id: 974723,
//        avatar_url: 'https://avatars.githubusercontent.com/u/974723?',
//        gravatar_id: '061f75a1a59b4a089d82e79f773ce424',
//        url: 'https://api.github.com/users/scottcorgan',
//        html_url: 'https://github.com/scottcorgan',
//        followers_url: 'https://api.github.com/users/scottcorgan/followers',
//        following_url: 'https://api.github.com/users/scottcorgan/following{/other_user}',
//        gists_url: 'https://api.github.com/users/scottcorgan/gists{/gist_id}',
//        starred_url: 'https://api.github.com/users/scottcorgan/starred{/owner}{/repo}',
//        subscriptions_url: 'https://api.github.com/users/scottcorgan/subscriptions',
//        organizations_url: 'https://api.github.com/users/scottcorgan/orgs',
//        repos_url: 'https://api.github.com/users/scottcorgan/repos',
//        events_url: 'https://api.github.com/users/scottcorgan/events{/privacy}',
//        received_events_url: 'https://api.github.com/users/scottcorgan/received_events',
//        type: 'User',
//        site_admin: false },
//     prerelease: false,
//     created_at: '2014-05-14T00:35:38Z',
//     published_at: '2014-05-14T00:44:20Z',
//     assets: [],
//     tarball_url: 'https://api.github.com/repos/divshot/divshot-cli/tarball/0.10.0',
//     zipball_url: 'https://api.github.com/repos/divshot/divshot-cli/zipball/0.10.0',
//     body: 'View the [0.10.0 milestone](https://github.com/divshot/superstatic/issues?milestone=2&page=1&state=closed) for full details.\r\n\r\n**Major updates**\r\n\r\n* [Updated Superstatic to 0.10.0](https://github.com/divshot/divshot-cli/issues/83) - that means it\'s faster, more stable, and adds the [redirects](https://github.com/divshot/superstatic/issues/50) configuration!\r\n* [Package out of date notification](https://github.com/divshot/divshot-cli/issues/80) - get notified when there is a newer version of divshot-cli\r\n* [Get specific configuration values](https://github.com/divshot/divshot-cli/issues/41) - no need to list your entire app\'s configuration. just use `divshot config <config name>` to get a specific value!\r\n* [Version badge](https://github.com/divshot/divshot-cli/issues/84) - Added a version badge so you always know the latest version on NPM\r\n* Various bug fixes' },
//   { url: 'https://api.github.com/repos/divshot/divshot-cli/releases/244657',
//     assets_url: 'https://api.github.com/repos/divshot/divshot-cli/releases/244657/assets',
//     upload_url: 'https://uploads.github.com/repos/divshot/divshot-cli/releases/244657/assets{?name}',
//     html_url: 'https://github.com/divshot/divshot-cli/releases/tag/0.9.0',
//     id: 244657,
//     tag_name: '0.9.0',
//     target_commitish: 'master',
//     name: '0.9.0 - Improved Authentication Flow',
//     draft: false,
//     author:
//      { login: 'mbleigh',
//        id: 1022,
//        avatar_url: 'https://avatars.githubusercontent.com/u/1022?',
//        gravatar_id: '69dc78b59ef008c58e6e842f9f3e0624',
//        url: 'https://api.github.com/users/mbleigh',
//        html_url: 'https://github.com/mbleigh',
//        followers_url: 'https://api.github.com/users/mbleigh/followers',
//        following_url: 'https://api.github.com/users/mbleigh/following{/other_user}',
//        gists_url: 'https://api.github.com/users/mbleigh/gists{/gist_id}',
//        starred_url: 'https://api.github.com/users/mbleigh/starred{/owner}{/repo}',
//        subscriptions_url: 'https://api.github.com/users/mbleigh/subscriptions',
//        organizations_url: 'https://api.github.com/users/mbleigh/orgs',
//        repos_url: 'https://api.github.com/users/mbleigh/repos',
//        events_url: 'https://api.github.com/users/mbleigh/events{/privacy}',
//        received_events_url: 'https://api.github.com/users/mbleigh/received_events',
//        type: 'User',
//        site_admin: false },
//     prerelease: false,
//     created_at: '2014-03-26T20:46:41Z',
//     published_at: '2014-03-27T23:35:34Z',
//     assets: [],
//     tarball_url: 'https://api.github.com/repos/divshot/divshot-cli/tarball/0.9.0',
//     zipball_url: 'https://api.github.com/repos/divshot/divshot-cli/zipball/0.9.0',
//     body: 'In this release, `divshot login` has received a big upgrade to a new, PIN-less authentication system. When run, it should open your browser to Divshot\'s authentication server. Once authenticated, the client will gain authorization without you needing to enter a PIN code.' } ];
// }

// function mockTree () {
//   return [ 'html',
//                         [ 'p',
//                           'View the ',
//                           [ 'a', [Object], '0.10.0 milestone' ],
//                           ' for full details.' ],
//                         [ 'p', [ 'strong', 'Major updates' ] ],
//                         [ 'ul',
//                           [ 'li',
//                             [Object],
//                             ' - that means it\'s faster, more stable, and adds the ',
//                             [Object],
//                             ' configuration!' ],
//                           [ 'li',
//                             [Object],
//                             ' - get notified when there is a newer version of divshot-cli' ],
//                           [ 'li',
//                             [Object],
//                             ' - no need to list your entire app\'s configuration. just use ',
//                             [Object],
//                             ' to get a specific value!' ],
//                           [ 'li',
//                             [Object],
//                             ' - Added a version badge so you always know the latest version on NPM' ],
//                           [ 'li', 'Various bug fixes' ] ] ];
}