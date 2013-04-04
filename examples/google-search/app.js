
var express = require('express.io');
var rack = require('asset-rack');
var app = express().http().io();
var list = require('./data')

app.use(new rack.Rack([
    new rack.StaticAssets({
        dirname: __dirname,
        urlPrefix: '/'
    }),
    new rack.BrowserifyAsset({
        filename: __dirname + '/../../lib/index.coffee',
        url: '/bone.io.js'
    })
]));

// listings controller
app.io.route('listings', {
    search: function(request) {

        var listMatches = [];
        list.forEach(function(simpsonChar) {
            regex = new RegExp(request.data.toLowerCase());
            if((regex).test(simpsonChar.toLowerCase())) {
                listMatches.push(simpsonChar);
            }
        });
        request.io.emit('listings:results', listMatches);
    },
});

app.get('/', function(req, res) {
    res.redirect('/client.html');
});

console.log('starting server')


app.listen(7076);

module.exports = app;
