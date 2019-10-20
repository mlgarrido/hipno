var express = require('express');
var router = express.Router();
var fs = require('fs')

router.get('/', (req, res, next) => {
  // res.render('index.html', {Title: "Thor"});
  fs.readFile(__dirname + '/../../app/dist/index.html', 'utf8', function(err, text){
    console.log(err)
    res.send(text);
  });
})

module.exports = router;
