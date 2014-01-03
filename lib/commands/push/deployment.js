var _ = require('lodash');
var tarzan = require('tarzan');
var ignoreGlobs = require('superstatic').ignore.globs;

var Deployment = function (types, loadpoint, exclude) {
  this._types = types;
  this._loadpoint = loadpoint;
  this._exclude = exclude;
  
  this._requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      Authorization: this._loadpoint.authorization
    }
  };
};

Deployment.prototype.push = function (appRootDir) {
  if (this._types.zip) {
    this._deployment = this._types.zip;
    
    this._requestOptions.url = this._loadpoint.zip_url;
  }
  else if (this._types.file) {
    this._deployment = this._types.file;
    
    this._requestOptions.url = this._loadpoint.put_url + '/' + this._deployment.path.replace(appRootDir, '');
    this._requestOptions.headers['Content-Length'] = fs.lstatSync(this._deployment.path).size;
  }
  else {
    this._requestOptions.url = this._loadpoint.tar_url;
    
    this._deployment = tarzan({
      directory: appRootDir,
      ignore: _.union(ignoreGlobs, this._exclude)
    });
  }
  
  return this._deployment;
};

module.exports = Deployment;