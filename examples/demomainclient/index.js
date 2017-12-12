//var compression = require('compression');
var express = require('express');
const fs = require('fs');
var serverport = 3001;
var expiryDate = new Date(Date.now() + 60 * 60 * 1000 * 10); //10 hour
//var helmet = require('helmet');
var app = require('express')();
var server  = require("http").createServer(app);

//special reverse proxy headers settings
app.set('trust proxy', 1);

server.listen(3001, function () {
  console.log('mainclient listening at port %d', 3001);
});

// Routing
app.use(express.static(__dirname + '/app'));
