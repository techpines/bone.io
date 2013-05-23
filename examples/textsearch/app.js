
// Grab all of our dependencies
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server, {log: false}),
    bone = require('../../.'),
    pathutil = require('path'),
    list = require('./data');

// Configure the listings data source
// We are using the socket.io server adapter
bone.io.Listings = bone.io('listings', {
    adapter: 'socket.io',
    options: {
        sockets: io.sockets
    },
    outbound: {
        shortcuts: ['results'],
    },

    // Route incoming data requests
    // for the listings data source
    inbound: {

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
            this.results({fragment: fragment, listings: matches}, context);
        }
    }
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
