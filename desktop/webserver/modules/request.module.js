var http = require('http');
var querystring = require('querystring');
var Buffer = require('buffer').Buffer;

var request = {};

request.do = function (method, path, params, callback, error) {
  if (path.indexOf('http') === -1) {
    error('Incorrect protocol');
    return;
  }

  var headers = {};
  if( method == 'GET' ) {
    for( var key in params ) {
      path += '&';
      path += key + '=' + params[key];
    }
  } else if( method == 'POST' ) {
    params = querystring.stringify(params);

    headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(params)
    };
  }

  console.log('Request - [http request][' + method + '] Headers: ' + JSON.stringify(headers));
  console.log('Request - [http request][' + method + '] Path: ' + path);

  var host = path.split('/')[2].split(':')[0];

  var port = (path.split('/')[2].split(':').length == 2 ? path.split('/')[2].split(':')[1] : 80);

  var options = {
    host: host,
    path: path,
    port: port,
    headers: headers,
    method: method
  };

  var req = http.request(options, (res) => {
    var str = '';
    res.on('data', (chunk) => {
      str += chunk;
    });

    res.on('end', () => {
      try {
        res = JSON.parse(str);
      } catch (e) {
        res = str;
      }

      callback(res);
    });
  });

  req.on('error', (e) => {
    console.log(e);
    error(e)
  });

  if( method == 'POST' ) {
    req.write(params);
  }

  req.end();
}

module.exports = request

/*var querystring = require('querystring');
var req = require('request');

var request = {};

request.post = function (url, data, callback, error) {
  var formData = querystring.stringify(data);
  var contentLength = formData.length;

  req({
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': contentLength
    },
    uri: url,
    body: formData,
    method: 'POST'
  }, function (err, response, body) {
    console.log(err);
    console.log(response);
    console.log(body);
    if (err) {
      error(err);
      return console.log(err);
    }

    res = '';
    try {
      res = JSON.parse(body);
    } catch (e) {
      res = body;
    }

    callback(res);
  });
}

module.exports = request*/
