var mysql = require('mysql');

var model = {
  con: null
}

model.connect = function (data, callback, error) {
  model.con = mysql.createConnection({
    host: data.host,
    port: data.port,
    database: data.db,
    user: data.user,
    password: data.password
  });

  model.con.connect(function(e) {
    if (e) {
      console.log(e);
      error(e);
    } else {
      callback(model.con);
    }
  });
}

module.exports = model;
