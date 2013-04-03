# bone.io

Front end Javascript franework

## Dependencies

[Jquery ](http://jquery.com/)
[Socket.io](http://socket.io/)

In this example we also use:

[Asset-rack](https://github.com/techpines/asset-rack)
[Express.io](https://github.com/techpines/express.io)

## Simple App Setup

```html
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
    <script src="/socket.io/socket.io.js"></script>
    <script src="/bone.io.js"></script>
    <script src="/client.js"></script>

```

## Installaion

First install:

```bash
npm install bone.io
```

## Views

Creating a view

```javascript
var myView = bone.view('.my-selector', {
    events: {
        'click button.my-button': 'myFunction'
    },
    refresh: function(root, iodatan) {
        ...
    }
    myFunction: function(root, event) {

        bone.io.get('someDataName').emit('my-io-function:iodata', 'some input');
    }


});
```

## Server Side

```javascript
var app = express().http().io();

app.io.route('my-io-function', {
    someDataName: function(request) {
        ...

        request.io.emit('my-io-function:iodata', returnData);
    },
});

```



## Our Example

## Create a View

in client.js 

```javascript
var searchContainer = bone.view('.search-container', {
    events: {
        'keyup input.search': 'search'
    },
    refresh: function(root, listings) {
        var self = this;
        var $listings = $(root).find('ul.listings');
        $listings.html('');
        $.each(listings, function(index, listing) {
            $('<li>').appendTo($listings)
                     .html(self.highlight(listing));
        });
    },
    highlight: function(root, item) {
        var fragment = $(root).data('fragment');
        fragment = fragment.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
        regex = new RegExp('(' + fragment + ')', 'ig');
        return item.replace(regex, function ($1, match) {
            return '<strong>' + match + '</strong>'
        });
    },
    search: function(root, event) {
        var fragment = $(root).find('input.search').val();
        if (fragment.length == 0) {
            return searchContainer.refresh([]);
        }
        $(root).data('fragment', fragment);
        bone.io.get('listings').emit('listings:search', fragment);
    }
});

```

## The server

in app.js

```javascript

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
        filename: '../../lib/index.coffee',
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

app.listen(7076);
```


## Event Logger

Four types of events:

* Data
* Interface
* View
* Route 

And here would be sample output for each:

```js
Data: [Source:Action]
Interface: [Selector:EventName]
View: [Selector:Action]
Route: TBD
```