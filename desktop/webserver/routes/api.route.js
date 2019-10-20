var express = require('express');
var router = express.Router();

var config = require('../../config');

router.get('/config', function(req, res, next) {
  config.getConfig(function(configData) {
    res.json({
      'success': true,
      'config': configData
    });
  });
});

module.exports = router;
