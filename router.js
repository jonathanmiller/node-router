var bouncy = require( 'bouncy' );
var parse  = require( 'url' ).parse;
var redis  = require( 'redis' ).createClient();
var log    = require( 'winston' );

var server = bouncy(function (req, res, bounce) {
  log.info( '%s %s %s from %s', req.method, req.headers[ 'x-host' ], req.url, req.headers.host );

  var token = req.headers[ 'x-host' ].split( '.' )[0];
  token = token || 'default';

  redis.srandmember( 'route::' + token, function( err, route ) {
    log.info( 'lookup on %s yielded %s', token, route );

    if ( err ) throw err;

    if ( route === null ) {
      res.statusCode = 404;
      res.end();
      return;
    }

    console.log( 'Upgrade header: %s', req.headers['upgrade'] );
    console.log( 'Connection header: %s', req.headers['connection'] );

    var upgrade = req.headers['upgrade'];
    var connection = req.headers['connection']

    var headers = {
      'x-token': token,
      'x-articulated-route': route,
      'x-proxy': 'interesting-times-club'
    };  

    if ( upgrade !== void 0 ) {
      headers.upgrade = upgrade;
      headers.connection = connection;
    }

    var opts = {
      headers: headers
    };

    bounce( route, opts );
  });
});

var port = 23456;

server.listen( port, function() {
  console.log( 'Router listening on port ' + port );
});
