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

    var opts = {
      headers: {
        'x-token': token,
        'x-articulated-route': route,
        'x-proxy': 'interesting-times-club'
      }
    };

    bounce( route, opts );
  });
});

server.listen( 23456 );
