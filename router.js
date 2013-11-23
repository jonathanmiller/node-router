var bouncy = require( 'bouncy' );
var parse  = require( 'url' ).parse;
var redis  = require( 'redis' ).createClient();

var server = bouncy(function (req, res, bounce) {
  console.log( 'incoming %s', req.headers.host );
  console.log( 'path->%s', req.url );

  var token = req.headers[ 'x-host' ].split( '.' )[0];
  //var path = req.url.split( '/' );

  //var token = path < 2 ? 'default' : path[1]; 
  token = token || 'default';

  redis.hget( 'routes', token, function( err, route ) {
    console.log( 'lookup on %s yielded %s', token, route );

    if ( err ) throw err;

    if ( route === null ) {
      console.log( 'sending 404' );
      res.statusCode = 404;
      res.end();
      return;
    }

    res.setHeader( 'x-proxy', 'interesting-times-club' );

    var opts = {
      headers: {
        'x-proxy': 'interesting-times-club'
      }
    };

    bounce( route, opts );
  });
});

server.listen( 23456 );
