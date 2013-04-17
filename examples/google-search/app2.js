
// Grab all of our dependencies
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    bone = require('../../lib/server/index'),
    list = require('./data');

// Configure the listings data source
// We are using the socket.io server adapter
bone.io.configure('listings', {
    adapter: 'socket.io-server',
    io: io,
    actions: [
        'results'
    ]
});

// Route incoming data requests
// for the listings data source
bone.io.route('listings', {

    // Defines an incoming data route
    search: function(fragment, context) {
    
        // Handles the fragment searching logic
        var matches = []
        list.forEach(function(char) {
           regex = new RegExp(fragment.toLowerCase());
            if((regex).test(char.toLowerCase())) {
                matches.push(char);
            } 
        });
        // Calling the results action on the adapter
        this.results(matches);
    }
});

app.use('/', express.static(__dirname));

// Make sure the client html gets served
app.get('/', function(req, res) {
    res.redirect('/client.html');
});

// Listen on a fun port
server.listen(7076);
