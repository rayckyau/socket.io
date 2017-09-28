const FADE_TIME = 150; // ms
const TYPING_TIMER_LENGTH = 400; // ms
const COLORS = [
  '#e21400', '#91580f', '#f8a700', '#f78b00',
  '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
  '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];

// Initialize variables
const $window = $(window);
const $usernameInput = $('.usernameInput'); // Input for username
const $roomInput = $('.roomInput'); // Input for room code
const $messages = $('.messages'); // Messages area
const $inputMessage = $('.inputMessage'); // Input message input box

const $loginPage = $('.login.page'); // The login page
const $chatPage = $('.chat.page'); // The chatroom page
const $drawPage = $('.draw.page'); // The draw page

// Prompt for setting a username
var username;
let connected = false;
let typing = false;
var lastTypingTime;
var $currentInput = $usernameInput.focus();
let socketReady = false;

var socket;
var drawObj;

// This demo depends on the canvas element
if (!('getContext' in document.createElement('canvas'))) {
  alert('Sorry, it looks like your browser does not support canvas!');
}

const doc = $(document),
  win = $(window),
  canvas = $('#paper'),
  ctx = canvas[0].getContext('2d'),
  instructions = $('#instructions');

// Generate an unique ID
let id = Math.round($.now() * Math.random());

// A flag for drawing activity
let drawing = false;

let clients = {};
let cursors = {};

let prev = {};

// Get the position of the mouse relative to the canvas
function getMousePos(canvasDom, mouseEvent) {
  var rect = canvasDom.getBoundingClientRect();
  return {
    x: mouseEvent.clientX - rect.left,
    y: mouseEvent.clientY - rect.top
  };
}

// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
  var rect = canvasDom.getBoundingClientRect();
  return {
    x: touchEvent.touches[0].clientX - rect.left,
    y: touchEvent.touches[0].clientY - rect.top
  };
}

canvas[0].addEventListener("touchstart", function(e) {
  mousePos = getTouchPos(canvas[0], e);
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas[0].dispatchEvent(mouseEvent);
}, false);

canvas[0].addEventListener("touchend", function(e) {
  var mouseEvent = new MouseEvent("mouseup", {});
  canvas[0].dispatchEvent(mouseEvent);
}, false);

canvas[0].addEventListener("touchmove", function(e) {
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas[0].dispatchEvent(mouseEvent);
}, false);

canvas.on('mousedown', function(e) {
  e.preventDefault();
  drawing = true;
  prev.x = e.pageX;
  prev.y = e.pageY;

  // Hide the instructions
  instructions.fadeOut();
});

canvas.bind('mouseup mouseleave', function() {
  drawing = false;
});

var lastEmit = $.now();

canvas.on('mousemove', function(e) {
  if (socketReady) {
    if ($.now() - lastEmit > 30) {
      socket.emit('mousemove', {
        'x': e.pageX,
        'y': e.pageY,
        'drawing': drawing,
        'id': id
      });
      lastEmit = $.now();
    }
    // Draw a line for the current user's movement, as it is
    // not received in the socket.on('moving') event above
    if (drawing) {

      drawLine(prev.x, prev.y, e.pageX, e.pageY);

      prev.x = e.pageX;
      prev.y = e.pageY;
    }
  }
});

// Remove inactive clients after 10 seconds of inactivity
setInterval(function() {

  for (var ident in clients) {
    if ($.now() - clients[ident].updated > 10000) {

      // Last update was more than 10 seconds ago.
      // This user has probably closed the page

      cursors[ident].remove();
      delete clients[ident];
      delete cursors[ident];
    }
  }

}, 10000);

function drawLine(fromx, fromy, tox, toy) {
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.stroke();
}

function addParticipantsMessage(data) {
  var message = '';
  if (data.numUsers === 1) {
    message += "there's 1 participant";
  } else {
    message += "there are " + data.numUsers + " participants";
  }
  log(message);
}

// Sets the client's username
function setUsername() {
  var username = cleanInput($usernameInput.val().trim());
  var room = cleanInput($roomInput.val().trim()).toUpperCase();

  if (username) {
    $loginPage.fadeOut();
    $drawPage.show();
    $loginPage.off('click');
    $currentInput = $inputMessage.focus();
    var url = 'http://' + window.location.hostname + ':3000/';
    socket = io(url + room);
    defineSocket();
    socketReady = true;
    console.log('User try socket: %s', url + room);
    // Tell the server your username
    socket.emit('add user', username);
  }
}

// Sends a chat message
function sendMessage() {
  var message = $inputMessage.val();
  // Prevent markup from being injected into the message
  message = cleanInput(message);
  // if there is a non-empty message and a socket connection
  if (message && connected) {
    $inputMessage.val('');
    addChatMessage({
      username: username,
      message: message
    });
    // tell server to execute 'new message' and send along one parameter
    socket.emit('new message', message);
  }
}

// Log a message
function log(message, options) {
  var $el = $('<li>').addClass('log').text(message);
  addMessageElement($el, options);
}

// Adds the visual chat message to the message list
function addChatMessage(data, options) {
  // Don't fade the message in if there is an 'X was typing'
  var $typingMessages = getTypingMessages(data);
  options = options || {};
  if ($typingMessages.length !== 0) {
    options.fade = false;
    $typingMessages.remove();
  }

  var $usernameDiv = $('<span class="username"/>')
    .text(data.username)
    .css('color', getUsernameColor(data.username));
  var $messageBodyDiv = $('<span class="messageBody">')
    .text(data.message);

  var typingClass = data.typing ? 'typing' : '';
  var $messageDiv = $('<li class="message"/>')
    .data('username', data.username)
    .addClass(typingClass)
    .append($usernameDiv, $messageBodyDiv);

  addMessageElement($messageDiv, options);
}

// Adds the visual chat typing message
function addChatTyping(data) {
  data.typing = true;
  data.message = 'is typing';
  addChatMessage(data);
}

// Removes the visual chat typing message
function removeChatTyping(data) {
  getTypingMessages(data).fadeOut(function() {
    $(this).remove();
  });
}

// Adds a message element to the messages and scrolls to the bottom
// el - The element to add as a message
// options.fade - If the element should fade-in (default = true)
// options.prepend - If the element should prepend
//   all other messages (default = false)
function addMessageElement(el, options) {
  var $el = $(el);

  // Setup default options
  if (!options) {
    options = {};
  }
  if (typeof options.fade === 'undefined') {
    options.fade = true;
  }
  if (typeof options.prepend === 'undefined') {
    options.prepend = false;
  }

  // Apply options
  if (options.fade) {
    $el.hide().fadeIn(FADE_TIME);
  }
  if (options.prepend) {
    $messages.prepend($el);
  } else {
    $messages.append($el);
  }
  $messages[0].scrollTop = $messages[0].scrollHeight;
}

// Prevents input from having injected markup
function cleanInput(input) {
  return $('<div/>').text(input).text();
}

// Updates the typing event
function updateTyping() {
  if (connected) {
    if (!typing) {
      typing = true;
      socket.emit('typing');
    }
    lastTypingTime = (new Date()).getTime();

    setTimeout(function() {
      var typingTimer = (new Date()).getTime();
      var timeDiff = typingTimer - lastTypingTime;
      if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
        socket.emit('stop typing');
        typing = false;
      }
    }, TYPING_TIMER_LENGTH);
  }
}

// Gets the 'X is typing' messages of a user
function getTypingMessages(data) {
  return $('.typing.message').filter(function(i) {
    return $(this).data('username') === data.username;
  });
}

// Gets the color of a username through our hash function
function getUsernameColor(username) {
  // Compute hash code
  var hash = 7;
  for (var i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + (hash << 5) - hash;
  }
  // Calculate color
  var index = Math.abs(hash % COLORS.length);
  return COLORS[index];
}

// Keyboard events
$window.keydown(function(event) {
  // Auto-focus the current input when a key is typed
  if (!(event.ctrlKey || event.metaKey || event.altKey)) {
    //$currentInput.focus();
  }
  // When the client hits ENTER on their keyboard
  if (event.which === 13) {
    if (username) {
      sendMessage();
      socket.emit('stop typing');
      typing = false;
    } else {
      setUsername();
    }
  }
});

$inputMessage.on('input', function() {
  updateTyping();
});

// Socket events
function defineSocket() {
  // Whenever the server emits 'login', log the login message
  socket.on('login', function(data) {
    connected = true;
    // Display the welcome message
    var message = "Welcome to Socket.IO Chat – ";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });

  socket.on('moving', function(data) {

    if (!(data.id in clients)) {
      // a new user has come online. create a cursor for them
      cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
    }
    // Move the mouse pointer
    cursors[data.id].css({
      'left': data.x,
      'top': data.y
    });
    // Is the user drawing?
    if (data.drawing && clients[data.id]) {
      // Draw a line on the canvas. clients[data.id] holds
      // the previous position of this user's mouse pointer
      drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
    }
    // Saving the current client state
    clients[data.id] = data;
    clients[data.id].updated = $.now();
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function(data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function(data) {
    log(data.username + ' joined');
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function(data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function(data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function(data) {
    removeChatTyping(data);
  });

  socket.on('disconnect', function() {
    log('you have been disconnected');
  });

  socket.on('reconnect', function() {
    log('you have been reconnected');
    if (username) {
      socket.emit('add user', username);
    }
  });

  socket.on('reconnect_error', function() {
    log('attempt to reconnect has failed');
  });
}
