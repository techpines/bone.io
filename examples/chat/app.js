
var app = require('express')(),
    app.server = require('http').createServer(app),
    app.io = require('socket.io').listen(server);

// Grab
bone = require('bone');
bone.io.set('config', {server: app.io});

bone.io.Chat = bone.io('chat', {
    inbound: {
        join: function(roomName, context) {
            this.join
        },
    }
});
