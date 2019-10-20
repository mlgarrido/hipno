var socket = {}

socket.start = function(server, app, mainWindow) {
  var io = require('socket.io')(server);

  io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  });

  console.log('Websocket - Started!');

  return io;
}

module.exports = socket;
