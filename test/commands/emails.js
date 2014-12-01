var divshot = require('../../lib');
var test = require('tapes');
var join = require('join-path');
var Mocksy = require('mocksy');
var server = new Mocksy({port: 4321});

var emails = test('emails');

emails.test('lists emails', function (t) {
  
  t.plan(3);
  
  var app = divshot();
  
  app.api
    .when('GET', join('/', app.emails._resource.all._uri))
    .respond('emails');
  
  app.emails(function (err, emails, response) {
    
    t.equal(emails, 'emails', 'returns emails');
    t.ok(response.context.headers.authorization, 'set the auth header');
  });
  
  app.api
    .when('GET', join('/', app.emails._resource.all._uri))
    .respond('emails')
    .status(404);
  
  app.emails(function (err, emails, response) {
    
    t.equal(response.statusCode, 404, 'handles response error');
  });
});

emails.test('adds emails', function (t) {

  t.plan(5);
  
  var app = divshot();
    
  app.api
    .when('POST', join('/', app.emails._resource.add._uri))
    .respond('emails');
  
  app.emails.add(null, function (err, body) {
    
    t.ok(err instanceof Error, 'error for missing email');
  });
  
  app.emails.add('asdf', function (err) {
    
    t.ok(err instanceof Error, 'error for invalid email');
  });
  
  app.emails.add('test@test.com', function (err, body, response) {
    
    t.deepEqual(response.request.body, {address: 'test@test.com'}, 'body on request');
    t.equal(response.method, 'POST', 'posted the request');
    t.equal(body, 'emails', 'response');
  });
});

emails.test('removes emails', function (t) {
  
  t.plan(1);
  
  var app = divshot();
    
  app.api
    .when('DELETE', '/self/emails/test@test.com')
    .respond('emails');
  
  app.emails.remove(null, function (err, body) {
    
    t.ok(err instanceof Error, 'error for missing email');
  });
  
  // TODO: test the actual call
});

emails.test('resends emails');