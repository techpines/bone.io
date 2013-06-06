
// Grab all of our dependencies
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server, {log: false}),
    bone = require('../../.'),
    pathutil = require('path'),
    fs = require('fs');

bone.io.LiveReload = bone.io('live-reload', {
    adapter: 'socket.io',
    options: {
        sockets: io.sockets
    },
    outbound: {
        shortcuts: ['cssChanged']
    }
});

fs.watch(pathutil.resolve(__dirname + '/style.css'), function() {
    var LiveReload = bone.io.LiveReload;
    LiveReload.cssChanged(fs.readFileSync('./style.css', 'utf8'));    
});

// Make sure the client html gets served
app.get('/', function(req, res) {
    res.redirect('./search.html?path=./client.html');
});

app.get('*', function(req, res) {
    res.sendfile(pathutil.resolve(req.query.path));
});

// Listen on a fun port
server.listen(7076);
