/*jshint esversion: 6 */
// Setup basic express server
var ArrayList = require('arraylist');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../..')(server);
var port = process.env.PORT || 3000;
var roomList = new ArrayList();
var namespaces = {};

let roommainclientdict = {};
let mainclientid;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

function createRoomCode (){
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var text = "";
  for (var i=0;i<5;i++){
    text += possible.charAt(Math.floor(Math.random()*possible.length));
  }

  return text;
}

function initRoomNS(roomCode){
  var room = io.of('/'+roomCode)
  .on('connection', function (socket) {
    var addedUser = false;
    var numUsers = 0;

    socket.on('changestateall', function (data) {
        socket.broadcast.emit('changestateall', data);
    });

    socket.on('changestateprivate', function (data) {
        let client = data.client;
        console.log('changestate private : '+client);
        socket.to(client).emit('changestateall', data);
    });

    socket.on('makeadmin', function (data) {
        let client = data.client;
        console.log('make admin : '+ client);
        socket.to(client).emit('makeadmin', data);
    });

    socket.on('sendbutton', function (data) {
        console.log('received: sendbutton');
        let mainclient = namespaces[roomCode];
        socket.to(mainclient).emit('sendbutton', data);
    });

    socket.on('sendvote', function (data) {
        console.log('received: sendvote ' + data.id);
        let mainclient = namespaces[roomCode];
        socket.to(mainclient).emit('sendvote', data);
    });

    // when the client emits 'mousemove', this listens and executes
    socket.on('mousemove', function (data) {
        let mainclient = namespaces[roomCode];
        socket.to(mainclient).emit('moving', data);
    });

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
      // we tell the client to execute 'new message'
      socket.broadcast.emit('new message', {
        username: socket.username,
        message: data
      });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
      console.log('User connect: %s', username);
      if (addedUser) return;
      if (username == 'mainclient'){
        console.log('mainclient joined with id: '+ socket.id);
        namespaces[roomCode] = socket.id;
        //register roomcode with socketid, tuple pair for redis/db
      }
      // we store the username in the socket session for this client
      socket.username = username;
      ++numUsers;
      addedUser = true;
      let socketid = socket.id;
      socket.emit('login', {
        numUsers: numUsers,
        id: socketid,
        mainclient: mainclientid
      });
      socket.emit('user joined', {
        username: socket.username,
        numUsers: numUsers,
        id: socket.id,
      });
      socket.broadcast.emit('user joined', {
        username: socket.username,
        numUsers: numUsers,
        id: socket.id,
      });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
      socket.broadcast.emit('typing', {
        username: socket.username
      });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
      socket.broadcast.emit('stop typing', {
        username: socket.username
      });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
      if (addedUser) {
        --numUsers;

        // echo globally that this client has left
        socket.broadcast.emit('user left', {
          username: socket.username,
          numUsers: numUsers
        });
      }
    });
  }

  );


  //return namespace obj
  return room;
}

//room creation
app.post('/createRoom', function (req, res) {
   //read machine id
   //read secret token


   //create room
   var roomCode = createRoomCode();
   roomList.add(initRoomNS(roomCode));
   console.log('Room created %s', roomCode);
   res.end( JSON.stringify(roomCode));
   //else give error page

});

// Chatroom
