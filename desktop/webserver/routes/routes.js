var routes = {};

routes.load = function (app) {

	// Include all routes
  var index = require('./index');
  var api = require('./api.route');
  var api_utils = require('./api.utils.route');

  var fs = require('fs');
  var dir = '.tmp';
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

	// Load all routes
	app.use(function(req,res,next){
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Mx-ReqToken,X-Requested-With');

		next();
	});

  app.use('/', index);
  app.use('/api', api);
  app.use('/api/utils', api_utils);

	// Catch 404 and forward to error handler
	app.use(function(req, res, next) {
		res.json({'success': false, 'error': {'code': 404, 'reason': 'Route not found'}});
	});
};

module.exports = routes;
