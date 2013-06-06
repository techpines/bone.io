
// Setup our server and socket.io
var app = require('express')(),
    server = require('http').createServer(app),
    ioServer = require('socket.io').listen(server, {log: false}),
    pathutil = require('path');

// Configure bone.io
bone = require('../../.');
console.log(bone.io);
bone.io.set('config', {server: ioServer});

// Setup our Chat module
bone.io.Chat = bone.io('chat', {
    inbound: {
        register: function(room, context) {
            this.join(room);
        },
        send: function(data, context) {
            console.log('send the message foo');
            this(data.room).receive(data.message);
        }
    },
    outbound: {
        shortcuts: ['receive']
    }
});

// Make sure the client html gets served
app.get('/', function(req, res) {
    res.redirect('./search.html?path=./client.html');
});

app.get('*', function(req, res) {
    res.sendfile(pathutil.resolve(req.query.path));
});

// Listen on a great port.
server.listen(7076);

