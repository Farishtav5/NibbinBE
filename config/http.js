/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Sails/Express middleware to run for every HTTP request.                   *
  * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
  *                                                                           *
  * https://sailsjs.com/documentation/concepts/middleware                     *
  *                                                                           *
  ****************************************************************************/

  middleware: {

    /***************************************************************************
    *                                                                          *
    * The order in which middleware should be run for HTTP requests.           *
    * (This Sails app's routes are handled by the "router" middleware below.)  *
    *                                                                          *
    ***************************************************************************/

    order: [
      'cookieParser',
      'session',
      'switchDB',
      'bodyParser',
      'compress',
      'poweredBy',
      'router',
      'www',
      'favicon',
    ],


    /***************************************************************************
    *                                                                          *
    * The body parser that will handle incoming multipart HTTP requests.       *
    *                                                                          *
    * https://sailsjs.com/config/http#?customizing-the-body-parser             *
    *                                                                          *
    ***************************************************************************/

    // bodyParser: (function _configureBodyParser(){
    //   var skipper = require('skipper');
    //   var middlewareFn = skipper({ strict: true });
    //   return middlewareFn;
    // })(),

    switchDB: (function(){
      console.log('Local Initializing `switchDB` (HTTP middleware)...');
      return async function (req,res,next) {
        console.log('Received HTTP request: '+req.method+' '+req.path + ', host : ' + req.hostname, req.subdomains);
        let datastore = null
        if(sails.config.environment === 'production') 
          datastore = req.hostname === 'api.thekaavya.org' ? 'kaavya' : 'default';
        else datastore = req.subdomains[0] === 'kaavya' ? 'kaavya' : 'default';  //for local
        let stores = sails.getDatastore(datastore);
        let connectionString = stores.manager.connectionString;
        let Driver = stores.driver;
        let manager = (
        await Driver.createManager({ connectionString: connectionString })
        ).manager
        let conn = await Driver.getConnection({manager: manager})
        sails.config.db = conn.connection;
        await stores.leaseConnection(async (db) => {
          next();
        });
        // return next();
      };
    })(),

  },

};
