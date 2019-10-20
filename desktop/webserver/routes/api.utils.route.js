var express = require('express');
var router = express.Router();

var fs = require('fs');

const uuidv4 = require('uuid/v4');
const xlstojson = require("xls-to-json-lc");
const xlsxtojson = require("xlsx-to-json-lc");

router.post('/generate/images', function(req, res, next) {
  if (!req.files) {
    return res.status(400).json({
      'success': false,
      'error': 'C100'
    });
  }

  var file = req.files.file;
  var fileName = '.tmp/.' + uuidv4();
  if (file.name.indexOf('xlsx') !== -1) {
    file.mv(fileName + '.xlsx', function(err) {
      if (err) {
        return res.status(500).json({
          'success': false,
          'error': 'MF100'
        });
      }

      xlsxtojson({
        input: fileName + '.xlsx',
        output: fileName + '.json',
        lowerCaseHeaders: true
      }, function(err, result) {
        if (err) {
          return res.status(500).json({
            'success': false,
            'error': 'XLSX100'
          });
        } else {
          fs.unlinkSync(fileName + '.xlsx');
          generateImages(req, res, fileName)
        }
      });
    });
  } else if (file.name.indexOf('xls') !== -1) {
    file.mv(fileName + '.xls', function(err) {
      if (err) {
        return res.status(500).json({
          'success': false,
          'error': 'MF100'
        });
      }

      xlstojson({
        input: fileName + '.xls',
        output: fileName + '.json',
        lowerCaseHeaders: true
      }, function(err, result) {
        if (err) {
          return res.status(500).json({
            'success': false,
            'error': 'XLSX100'
          });
        } else {
          fs.unlinkSync(fileName + '.xls');
          generateImages(req, res, fileName);
        }
      });
    });
  } else {
    return res.status(400).json({
      'success': false,
      'error': 'C100'
    });
  }
});

function generateImages (req, res, fileName) {
  fs.readFile(fileName + '.json', 'utf8', function (err, data) {
    if (err) {
      return res.status(500).json({
        'success': false,
        'error': 'FS100',
        'error_detailed': err
      });
    }
    console.log(data);
    var data = JSON.parse(data);

    fs.unlinkSync(fileName + '.json');

    return res.json({
      'success': true,
      'data': data[0]
    });
  });
}

module.exports = router;
