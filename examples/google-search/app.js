
var express = require('express.io');
var rack = require('asset-rack');
var app = express().http().io();

app.use(new rack.Rack([
    new rack.StaticAssets({
        dirname: __dirname,
        urlPrefix: '/'
    }),
    new rack.BrowserifyAsset({
        filename: '../../lib/index.coffee',
        url: '/bone.io.js'
    })
]));

// listings controller
app.io.route('listings', {
    search: function(request) {
        request.io.emit('listings:result', []);
    },
});

app.get('/', function(req, res) {
    res.redirect('/client.html');
});

app.listen(7076);
