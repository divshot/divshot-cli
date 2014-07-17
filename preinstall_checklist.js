var platform = require('os').platform();
if(platform == 'win32') {
  console.log("We are very sorry, at this time we do not support installation on the windows platform.");
  console.log("We had an unfortunate situation where one of the modules we are using to deploy files");
  console.log("truncated files to 0-byte. This is not a good thing and we are working to fix it.");
  process.exit(1);
}
