var assert = require('assert');
var should = require('chai').should();
var shell = require('shelljs');
var chai = require('chai')
var chaiHttp = require('chai-http');

var exec = require('child_process').exec;
var mockserver = null;
var io = require('socket.io-client');
var testSocketURL = 'http://localhost:3000/';
var roomCode = null;
var request = require('request-promise');

chai.use(chaiHttp);

var ioOptions = {
  transports: ['websocket'],
  'force new connection': true
};

var clientstart = {

  connect: function(room) {
    return io('http://localhost:3000/' + room, ioOptions);
  },

  getRoomCode: function() {
    return request({
      method: 'POST',
      uri: 'http://localhost:3000/createRoom',
      body: {
        some: 'payload'
      },
      resolveWithFullResponse: true,
      json: true // Automatically stringifies the body to JSON
    });
  }
};


function startServer() {
  //shell.cd('/home/rayubu/Documents/socket.io/examples/chat');
  //shell.exec('node index.js', {async:true});
  mockserver = exec('node index.js', function(error, stdout, stderr) {
    /*
    console.log('stdout: ', stdout);
    console.log('stderr: ', stderr);
    if (error !== null){
        console.log('exec error: ', error);
    }
    */
  });

}


describe('GeneralServer:', function() {
  before(function() {
    console.log('start server');
    //startServer();
  });

  after(function() {
    console.log('kill server');
    //mockserver.kill();
    //shell.exec("kill -9 $(ps aux |grep '[n]ode index.js'|awk '{print $2}')");
  });
  this.timeout(500);
  it('send a POST request to start a new room', function(done) {
    chai.request('localhost:3000')
      .post('/createRoom')
      .send({
        'data': 'payload'
      })
      .end(function(err, res) {
        should.not.exist(err);
        if (err) {
          console.log(err);
        }
        res.should.have.status(200);
        res.body.should.be.a('object');
        should.exist(res.text);
        done();
      });


  });

  it('client on login', function(done) {
    clientstart.getRoomCode().then(function(response) {
      var client1 = io.connect(testSocketURL + response.body, ioOptions);

      client1.on('connect', function(data) {
        client1.emit('add user', 'client1');

        client1.on('login', function(data) {
          console.log(data.numUsers);
          //verify
          data.numUsers.should.equal(1);
          client1.disconnect();
          done();
        });
      });
    });

  });

  it('client test socket add user', function(done) {
    clientstart.getRoomCode().then(function(response) {
      var client1 = io.connect(testSocketURL + response.body, ioOptions);

      client1.on('connect', function(data) {
        client1.emit('add user', 'client1');

        client1.on('user joined', function(data) {
          //verify
          data.username.should.equal('client2');
          data.numUsers.should.equal(1);
          console.log(data.username + ' ' + data.numUsers);
          client1.disconnect();
          client2.disconnect();
          done();
        });
        /* Since first client is connected, we connect
        the second client. */
        var client2 = io.connect(testSocketURL + response.body, ioOptions);

        client2.on('connect', function(data) {
          client2.emit('add user', 'client2');
        });

      });

    });

  });

  //end tests

});
