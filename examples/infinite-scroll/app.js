
var express = require('express.io');
var rack = require('asset-rack');
var app = express().http().io();

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
        var fragment = request.data.fragment;
        var page= request.data.page;
        fragment = fragment.replace(" ","%20");
        console.log("User searched for:"+fragment)
        var http = require('http');
        var options = {
          hostname: 'search.twitter.com',
          port: 80,
          path: '/search.json?q='+fragment+"&page="+page,
          method: 'GET'
        };

        var req = http.request(options, function(res) {

        var data = '';
          res.on('data', function (chunk) {
           // tweets = JSON.parse(chunk.results);
           data += chunk;
          });



        res.on('end', function(){
            var tweets = JSON.parse(data);
            tweets= tweets.results;
            request.io.emit('listings:results', tweets);
        });
        });
    req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
});

// write data to request body
req.write('data\n');
req.write('data\n');
req.end();


        //request.io.emit('listings:results', listMatches);
    },
});

app.get('/', function(req, res) {
    res.redirect('/client.html');
});

console.log('starting server')


app.listen(7076);

module.exports = app;
