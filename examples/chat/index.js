/*jshint esversion: 6 */
// Setup basic express server
var ArrayList = require('arraylist');
var express = require('express');
//var app = express();
//var server = require('http').createServer(app);
//var io = require('../..')(server);
var port = process.env.PORT || 3000;
var roomList = new ArrayList();
var namespaces = {};

let roommainclientdict = {};

var app = require('express')(),
  server  = require("http").createServer(app),
  io = require("socket.io")(server),
  session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
  }),
  sharedsession = require("express-socket.io-session");



server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Attach session
app.use(session);

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

function queryRoomCode(roomcode){
  if (Object.keys(namespaces).includes(roomcode)){
    return true;
  }
  else {
    return false;
  }
}

function initRoomNS(roomCode){
  let room = io.of('/'+roomCode)
  .on('connection', function (socket) {
    var numUsers = 0;

    socket.on('changestateall', function (data) {
        socket.broadcast.emit('changestateall', data);
    });

    socket.on('changestateprivate', function (data) {
        let client = data.client;
        console.log('changestate private : '+client);
        socket.to(client).emit('changestateall', data);
    });

    socket.on('save session', function (data) {
        socket.handshake.session.statedata = data;
        socket.handshake.session.save();
    });

    socket.on('makeadmin', function (data) {
        let client = data.client;
        console.log('make admin : '+ client);
        socket.to(client).emit('makeadmin', data);
    });

    socket.on('changegame', function (data) {
        console.log('changegame : '+ data.game);
        socket.broadcast.emit('changegame', data);
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

    socket.on('mouseup', function (data) {
        let mainclient = namespaces[roomCode];
        socket.to(mainclient).emit('penup', data);
    });

    socket.on('mousedown', function (data) {
        let mainclient = namespaces[roomCode];
        socket.to(mainclient).emit('pendown', data);
    });

    socket.on('drawdot', function (data) {
        let mainclient = namespaces[roomCode];
        socket.to(mainclient).emit('drawdot', data);
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
      let mainclient = namespaces[roomCode];
      console.log('User connect: %s', username);
      if (username == 'mainclient'){
        console.log('mainclient joined with id: '+ socket.id);
        namespaces[roomCode] = socket.id;
        //register roomcode with socketid, tuple pair for redis/db
      }
      // we store the username in the socket session for this client
      socket.username = username;
      ++numUsers;
      let socketid = socket.id;
      socket.emit('login', {
        numUsers: numUsers,
        id: socketid
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
        // echo globally that this client has left
        socket.broadcast.emit('user left', {
          username: socket.username,
          numUsers: numUsers
        });
    });

    socket.on('reconnect user', function (data) {
        console.log('Found socket session');
        console.log('user: ' + socket.handshake.session.username);
        console.log('room: ' + socket.handshake.session.room);
        console.log('data: ' + socket.handshake.session.statedata);
        //find all session and replace the socketid

        let mainclient = namespaces[data.room];
        //say user reconnected
        socket.to(mainclient).emit('user reconnect', {
          id: socket.id,
          username: data.username
        });
        //send state from session
        socket.emit('changestateall', socket.handshake.session.statedata);
    });


  }

  );
  room.use(sharedsession(session, {
    autoSave: true
  }));
  //return namespace obj
  return room;
}

//room creation
app.post('/createRoom', function (req, res) {
   //TODO: read machine id and secret token as a key
   //create room
   let roomCode = createRoomCode();
   roomList.add(initRoomNS(roomCode));
   console.log('Room created %s', roomCode);
   res.setHeader('Content-Type', 'application/json');
   res.end( JSON.stringify(roomCode));
   //else give error page

});

app.get('/checkRoom/:room', function (req, res) {
   res.setHeader('Content-Type', 'application/json');
   //check room TODO: make this query redis
   let isRoomExists = queryRoomCode(req.params.room);
   console.log('Room check: ' + req.params.room + isRoomExists);
   if (isRoomExists){
     if (req.session.views){
       req.session.views++;
       req.session.room = req.params.room;
       req.session.username = req.query.username;
     }
     else{
       //TODO: delete created session
       console.log("room doesn't exist, don't make session");
     }
     res.send(isRoomExists);
   }
   else {
     res.send(isRoomExists);
   }
});

//check for session wherever you are
app.get('/checkSession', function (req, res)  {
   res.setHeader('Content-Type', 'application/json');
   //if session exists then send back username/roomcode
   if (req.session.views){
     res.end( JSON.stringify({views:req.session.views, username: req.session.username, room: req.session.room}));
   }
   else {
     req.session.views = 1;
     res.end(JSON.stringify({view: req.session.views}));
   }
});
