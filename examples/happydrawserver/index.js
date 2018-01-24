/*jshint esversion: 6 */
// Setup basic express server
var ArrayList = require('arraylist');
var compression = require('compression');
var express = require('express');
const fs = require('fs');

var serverport = process.env.SERVERPORT || 3000;
var roomList = new ArrayList();
var namespaces = {};
var playercount = {};
var expiryDate = new Date(Date.now() + 60 * 60 * 1000 * 10); //10 hour
let roommainclientdict = {};
var helmet = require('helmet');
let sslOptions = {
      cert: fs.readFileSync('./sslcert/server-crt.pem'),
      key: fs.readFileSync('./sslcert/server-key.pem'),
      ca: fs.readFileSync('./sslcert/ca-cert.pem')
};

var app = require('express')();

if (process.env.NODE_ENV == 'sslproduction'){
  sslOptions = {
    cert: fs.readFileSync('./sslcert/fullchain.pem'),
    key: fs.readFileSync('./sslcert/privkey.pem')
  };
  var server  = require("https").createServer(sslOptions, app),
    io = require("socket.io")(server);
}
else {
  var server  = require("http").createServer(app),
    io = require("socket.io")(server);
}

var session = require("express-session")({
    secret: "my-secret",
    name: 'sessionId',
    httpOnly: true,
    resave: true,
    saveUninitialized: true,
    expires: expiryDate
  }),
  sharedsession = require("express-socket.io-session");


// Add headers
app.use(function (req, res, next) {

    let allowedOrigins = ['http://demo.happydraw.net', 'http://www.happydraw.net', 'http://localhost:3001', 'http://127.0.0.1:3001'];
    let origin = req.headers.origin;

    if (allowedOrigins.indexOf(origin) > -1){
         res.setHeader('Access-Control-Allow-Origin', origin);
    }
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

//special reverse proxy headers settings
app.set('trust proxy', 1);

server.listen(serverport, function () {
  console.log('Server listening at port %d', serverport);
});

//use compression
if (process.env.NODE_ENV == 'production'){
  app.use(compression());
  //security
  app.use(helmet());
}

// Attach session
app.use(session);

// Routing
app.use(express.static(__dirname + '/public'));

var bodyParser = require('body-parser')
var methodOverride = require('method-override')

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);


function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' })
  } else {
    next(err)
  }
}


function logErrors (err, req, res, next) {
  console.error(err.stack)
  next(err)
}


function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render('error', { error: err })
}


function createRoomCode (){
  var possible = "ABCDEFGHIJKLMNPQRSTUVWXYZ";
  var text = "";
  var ROOMCODELENGTH = 4;
  for (var i=0;i<ROOMCODELENGTH;i++){
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

    socket.on('update username', function (data) {
        let client = data.client;
        console.log('update username : '+ client);
        socket.to(client).emit('update username', data);
    });

    socket.on('update sessionusername', function (username) {
        console.log('update sessionusername : '+ username);
        socket.handshake.session.username = username;
        socket.handshake.session.save();
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
        playercount[roomCode] = 0;
        socket.handshake.session.username = username;
        socket.handshake.session.save();
        //register roomcode with socketid, tuple pair for redis/db
      }
      // we store the username in the socket session for this client
      socket.username = username;
      playercount[roomCode]++;
      let socketid = socket.id;
      socket.emit('login', {
        numUsers: playercount[roomCode],
        id: socketid
      });
      socket.emit('user joined', {
        username: socket.username,
        numUsers: playercount[roomCode],
        id: socket.id,
      });
      socket.broadcast.emit('user joined', {
        username: socket.username,
        numUsers: playercount[roomCode],
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
        playercount[roomCode]--;
        // echo globally that this client has left
        socket.broadcast.emit('user left', {
          username: socket.handshake.session.username,
          numUsers: playercount[roomCode],
          id: socket.id
        });
        console.log("user left: " + socket.handshake.session.username);
        // if mainclient disconnected
        if (socket.handshake.session.username == 'mainclient'){
          console.log("kill all connections");
          const connectedNameSpaceSockets = Object.keys(room.connected); // Get Object with Connected SocketIds as properties
          connectedNameSpaceSockets.forEach(socketId => {
              room.connected[socketId].disconnect(); // Disconnect Each socket
          });
          room.removeAllListeners(); // Remove all Listeners for the event emitter
          delete io.nsps['/'+roomCode]; // Remove from the server namespaces
          delete namespaces[roomCode]; //remove room from storage

          //remove socket session from storage or let cookies expire
        }
    });

    socket.on('reconnect user', function (data) {
        console.log('Found socket session');
        console.log('user: ' + socket.handshake.session.username);
        console.log('room: ' + socket.handshake.session.room);
        //find all session and replace the socketid
        playercount[roomCode]++;
        let mainclient = namespaces[data.room];
        //say user reconnected
        socket.to(mainclient).emit('user reconnect', {
          id: socket.id,
          username: data.username
        });
        //send state from session
        socket.emit('changestateall', socket.handshake.session.statedata);
    });

    socket.on('kick user', function (data) {
        let client = data.client;
        let mainclient = namespaces[roomCode];
        console.log('kick: '+ client);
        socket.to(mainclient).emit('user kick', {username: data.username});
        socket.to(client).emit('kicked');
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
   res.end(JSON.stringify(roomCode));
   //else give error page

});

app.get('/checkRoom/:room', function (req, res) {
   res.setHeader('Content-Type', 'application/json');
   //check room TODO: make this query redis
   let isRoomExists = queryRoomCode(req.params.room);
   console.log('Room check: ' + req.params.room + isRoomExists);
   if (isRoomExists){
     if (playercount[req.params.room] < 9){
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
       console.log("room is full, don't make session");
     }
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
