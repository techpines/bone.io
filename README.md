
![bone.io](http://cdn.techpines.io/bone-io-github.png)

## Checkout the official site

[http://bone.io](bone.io)


### Introduction

Bone.io allows you to build realtime HTML5 apps using websockets to deliver "hot" data to the browser.  This enables you to easily construct rich, highly responsive user interfaces.

In a lot of ways, Bone.io can be viewed as a much improved version of Backbone.js.  Backbone, Angular and other older frameworks rely primarily on AJAX and model bindings to get data to the DOM.  The problem with this approach is that AJAX has no method for handling bi-directional communication.  In the world of modern data-driven HTML5 applications, Bone.io strives to pickup where these other frameworks have left off.

When we say that this framework is *lightweight*, we mean it.  Compressed and gzipped the entire library is __less than 4KB__ in size.  That's less than Backbone, less than Underscore, less than jQuery, less than just about everything.  

## Getting Started

You can use npm to install:

```js
npm install bone.io
```

Here is a simple setup for bone.io on the server using [express](http://expressjs.com/api.html) and [socket.io](http://socket.io/):

```js
// Setup express, socket.io, and http server
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
....
// Configure bone.io options
var bone = require('bone.io');
bone.set('io.options', {
    server: io
});
....
// Serves bone.io browser scripts
app.use(bone.static());
....    
// Listen up
server.listen(7076);
```

Here's how you the setup the browser:

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
<script src="/socket.io/socket.io.js"></script>
<script src="/bone.io/bone.io.js"></script>
<script>
    socket = io.connect();
    bone.set('io.options', {
        socket: socket 
    });
</script>
```

Bone.io handles configuration by using simple `get` and `set` syntax:

```js
bone.set('hostname', 'example.com');
bone.get('hostname') // 'example.com'
```

## IO

The __IO__ component provides support for asynchronous bi-directional communication between the browser and server.  

For most of the Web's history, communication between the browser and server has been dictated by the familiar request/response cycle.  The browser initiates a request and the server sends a response.  This paradigm leaves an obvious question of what should happen if the server wishes to initiate communication with the browser?

In bone.io, we've embedded the concept of bi-directional communication into the framework's core.  Whenever you create an IO module, you must specify both `inbound` and `outbound` data routes.  There is a natural symmetry underlying the concept of bi-directional communication, and we have attempted to design the api to make this concept as transparent and useful as possible.

Unlike other popular frameworks, there is no builtin support for Models or Collections in bone.io.  Instead you should think of IO modules more like a traditional data access layer.

### bone.io

To create an IO module you use the `bone.io` function.  The following is a sample module written for the browser:

```js
var Browser = bone.io('hot-data', {
    outbound: {
        routes: ['search', 'sort']
    },
    inbound: {
        results: function(data, context) {
          ...
        }
    }
});
```

And the corresponding module for the server:

```js
var Server = bone.io('hot-data', {
    outbound: {
        routes: ['results'],
    },
    inbound: {
        search: function(data, context) {
            ...
        },
        sort: function(data, context) {
            ...
        }
    }
});
```

For a browser and server module to be connected to one another they need to share the same `namespace`, which in our example above was `"hot-data"`.  Also, the `inbound` routes for a server module must be the `outbound` routes for a browser module and vice versa.  Otherwise the API is completely symmetrical.

In general, the `bone.io` function takes two arguments a `namespace` string and an `options` object.

```js
bone.io(namespace, options);
```

* `namespace` - A unique string identifying the IO module.
* `options.inbound` - The `inbound` object controls a modules inbound data routes.
* `options.inbound.[route]` - Inbound data route function.
* `options.inbound.middleware` - Array of inbound middleware functions.
* `options.outbound` - The `outbound` object controls a modules outbound data routes.
* `options.outbound.routes` - Array of strings identifying outbound data routes.
* `options.outbound.middleware` - Array of outbound middleware functions.


### inbound

All inbound data routes for both the browser and server have the following signature:

```js
  route: function(data, context) {
    ...
  }
```

* `data` - Data that was sent *into* the route from an outbound route.
* `context` - Context for understanding what to do with the data.

Inside an inbound route you can trigger `outbound` routes using the javascript `this` variable. 

```js
var Server = bone.io('hot-data', {
    outbound: {
        routes: ['results']
    },
    inbound: {
        search: function(data, context) {
            var results = db.find(data.searchTerm);
            this.results(results);  // Triggers the outbound "results"
        }
    },
});
```

### browser

While the api is the same for both the browser and server, the `context` object that gets passed to inbound data routes will be different.

The `context` variable for data routes in the browser has the following parameters:

* `route` - The name of the inbound route.
* `data` - The data object sent from the server.
* `namespace` - The namespace for the module.
* `socket` - The socket associated with the IO module.

### server

The server environment is slightly different, as an IO module on the server might be connected to thousands of individual browsers.  Whenever you receive inbound data from a browser, it will trigger one of your inbound data routes.

The `context` object will have the following parameters:

* `route` - The name of the current route.
* `data` - The data object sent from the server.
* `namespace` - The namespace for the module.
* `socket` - The socket.io socket object.
* `headers` - The HTTP headers sent with the initial handshake.
* `handshake` - The socket.io handshake object.

### pub/sub

On the server, you can tap into the pub/sub system by leveraging `room`s.  A room is a pub/sub channel.  When a browser module connects to an IO module on the server, you can optionally have that client `join` or `leave` a room.

Here is a simple chat example, which illustrates how to use rooms.

```js
var Chat = bone.io('chat', {
    outbound: {
        routes: ['broadcast']
    },
    inbound: {
        register: function(data, context) {
            this.join(data.room);
        },
        deregister: function(data, context) {
            this.leave(data.room);
        },
        send: function(data, context) {
            this.room(data.room).broadcast({message: data.message});
        }
    }
});
```

* `this.join(room)` - Makes a socket join a room, where `room` is a string.
* `this.leave(room)` - Makes a socket leave a room.
* `this.room(room)` - Returns a `Room` object that outbound routes can be sent to.

If you are in a different part of the application, and need to publish a message to a room, then you can achieve this by using the IO module itself:

```js
Chat.room('trendy-cats').broadcast({message: 'whatup everbody'});
```

### outbound

The `outbound` data routes are declared as strings in the `outbound.routes` array:

```js
var Chat = bone.io('chat', {
    oubound: {
        routes: ['broadcast']
    }
});
```

You can initiate an outbound route by calling it on the module:

```js
Chat.broadcast({message: 'hey guys'});
```

Or if you are inside of an inbound route, then you can call the outbound route by using `this`:

```js
send: function(data, context) {
    this.broadcast({message: 'hey guys'});
}
```

### middleware

Both on the browser and server there is a versatile system of `middleware`.  You can run middleware before your inbound data routes or before your outbound data routes.  This can be useful for authentication, setting up loading spinners and a number of other tasks.  The syntax is quite simple, you just add a `middleware` property to either your `inbound` or `outbound` object when declaring your IO module.

```js
bone.io('namespace', {
    inbound: {
        middleware: [
            sessionMiddleware,
            authenticationMiddleware
        ]
    },
    outbound: {
        middleware: [
            dropExpiredMessages
        ]
    }
});
```

The function signature for a middleware route is as follows:

```js
var authenticationMiddleware = function(data, context, next) {
    ...
}
```

* `data` - The data sent to the route.
* `context` - Context for the route (includes which `route` was called).
* `next` - A callback that must be called once the middleware finishes.

### sessions

Included is middleware for hooking into express sessions on the server.  This is usually a requirement for most applications, so it is included as a convenience.

Here is how you setup the middleware:

```js
// Session declaration
var sessionConfig = {
    secret: 'keyboard-kitty',
    store: new express.session.MemoryStore()  
};
....
// Hook into express
app.use(sessionConfig);
....
// Hook into bone.io
bone.io('authentication', {
    inbound: {
        middleware: [
            bone.io.middleware.sessions(sessionConfig); 
        ]
    }
});
```

*__NOTE__: By default, express "news" up a `MemoryStore` object if none is specified.  Because the bone.io session middleware needs this object, you need to declare it explicitly as in the example above.  Also, you should never use the express `MemoryStore` in production as it will leak memory.*


## Views

The __Views__ component enables intelligent DOM event binding and manipulation.  Views are selector based and declarative.  When you define a view, you are describing the behavior that should be associated with a given selector.  This fairly broad definition gives views in bone.io incredible power.

### bone.view

To setup a `view` module, use the `bone.view` function, which takes two parameters, a `selector`, and an `options` object:

```js
bone.view.DataRow = bone.view('tr.data-row', {
    events: {
        'click .icon': 'open',
        'click .button.edit': 'edit',
        'click .button.delete': 'remove'
    },
    remove: function(event) {
        this.$el.remove();
    },
    edit: function(data) {
        ...
    }
});
```

This single declaration would automatically apply to all elements that match the selector, `tr.data-row`.  Even if DOM elements are being added and removed, the behavior will still apply.  There is no need to manage the addition and removal of elements, simply declare the view and bone.io takes care of everything else.  

The only *caveat* is that when you remove an element that has `view` behavior, you must remove it with jQuery remove, `$.remove(element)`.  Jquery `remove` is smart so you can also call it on a parent element and it will do the `remove` operation on all of that parent's children.

### events

Views can respond to events that are defined in the `events` property when defining the view.  These events are bound to every DOM element that matches the `selector`, even if that element has not been created yet.

Events are written in the format:

```
{"event selector": "action"}
```

Whenever an `event` that matches the `selector` is fired, it will trigger the corresponding `action`, which should be a function defined within the view declaration. Omitting the `selector` will cause the event to be bound to the views root element.

### actions

The other properties of a view indicate which actions it can perform.  A view that handles modals might have the following actions:

```js
var Modal = bone.view('.modal', {
    open: function() {
        this.$el.show();
    },
    close: function() {
        this.$el.hide()
    }
});
```

Each view action has a few properties attached to `this`:

* `this.el` - The DOM element for the current action.
* `this.$el` - The jQuery element for the current action.
* `this.$` - Scoped find from root element, short hand for `this.$el.find`.
* `this.data` - Store and retrieve data on the element, shortcut for `$this.$el.data`.
* `this.templates` - The bone.io templates object (see the Templates section).

You can call these actions directly on the `View` object, but keep in mind it will run for all elements that match the view's selector.

```js
Modal.open();
Modal.close();
```

### scoping

Because views are selector-based they actually represent a collection of elements.  So if you were to call a method called `close` on the `View` object directly it would close all views that match that selector.

```js
View.close();
```

If you want to only close a certain view, you can do that by either passing in a selector or the `bone-id` for that view:

```js
View.$('#login-modal').close();
```

## Router

The __Router__ component enables you to provide linkable, bookmarkable, shareable URLs for locations in your application. This can be done using hash fragments (#page) or it can be done by taking advantage of the new HTML5 history api which will allow you to use standard URLs (/page). 

For browsers which don't yet support the History API, the Router handles graceful fallback and transparent translation to the fragment version of the URL.

After you create your routes, call `bone.router.start()`, or `bone.router.start({pushState: true})` to start the router and route the initial URL.

### bone.router

To initialize a set of routes you call the `bone.router` function:

```js
bone.router({
    routes: {
        "help":                 "help",    // #help
        "find/:query":          "search",  // #find/bones
        "find/:query/p:page":   "search"   // #find/bones/p7
    },
    help: function() {
        ...
    },
    find: function(query, page) {
        ...
    }
});
```

### routes

The routes object has route names for it's keys and the names of the corresponding route functions for it's values.

Here is an example:

```js
routes: {
    "help":                 "help",    // #help
    "find/:query":          "search",  // #find/bones
    "find/:query/p:page":   "search"   // #find/bones/p7
},
```

The route functions have the following function signature:

```js
action: function(params) {
    ...
}
```

Where `params` are the parameters from the URL.  

For example, a route of `"find/:query/p:page"` will match a fragment of `"#find/bones-mckinsey/p2"`, passing `"bones-mckinsey"` and `"2"` to the action.

### start

After declaring your routes via `bone.router`, you start the router by calling the `start` function.

```js
bone.router.start();
```

This starts the router and triggers the initial route.  

By default, it will use the hashbang (#) URLs, however it is recommended that you use HTML5 `pushState` to achieve standard (/) URLs instead of the hashbang URLs.  

To start the router using standard URLs, you need to call start with `pushState: true` option:

```js
bone.router.start({pushState: true});
```

### navigate

Often you will find yourself wanting to trigger routes manually.  You can do this with `router.navigate`.  

```js
bone.router.navigate('home');
```

By default, calling navigate will simply update the URL.  If you want to also trigger the corresponding route then you need to pass in the `trigger: true` option.

```js
bone.router.navigate('home', {trigger: true});
```

If you want to update the URL without creating an entry in the browser's history, set the `replace` option to `true`.

### middleware

The router also supports `middleware`, which can be declared when you are declaring your routes.  The `middleware` is defined as an array of middleware functions.

By correctly using middleware, you can keep repetitive pieces of code like, checking if the user is logged in or updating your navigation bar out of your routes.  This will make your routes smaller and cleaner, while leaving the cross cutting middleware concerns in a separated and logical place.

Here is an example using middleware:

```js
var middleware = {
    // Scroll back to the top of the page on route change
    scrollTop: function(route, next) {
        $(window).scrollTop(0);
        next();
    },
    // Track a page view with Google Analytics
    analytics: function(route, next) {
        _gaq.push(['_trackPageview', '/' + route]);
        next();
    }  
};
bone.router({
    routes: {
        '': 'home',
        'blog/:name': 'blog'
    }
    middleware: [
        middleware.scrollTop,
        middleware.anayltics
    ],
    home: function() {
        ...
    },
    blog: function(name) {
        ...
    }
});
```

A `middleware` function for the router takes two arguments, `route` and `next`.  The `route` parameter is simply the route that has been triggered.  And `next` is the callback that must be called after your route function completes.

## Templates

The __Templates__ component provides basic support for using templates.  There is no default templating engine in bone.io, the decision of what type of templates you use is up to you.  The only requirement is that you compile your templates into javascript functions.

To set templates for bone.io, do the following:

```js
bone.set('templates', {
    layout: function() { return '<div id="content"></div><div id="sidebar"></div>'},
    table: function() { return '<table></table>'},
    list: function(data) { return '<ul><li>Bone.io</li><li>'+data+'</ul>'}
});
```

### bone.templates

Once you set your templates you can reference them from the `bone.templates` variable.  They will also be available within bone.io view actions as `this.templates`.

### bone.mount

In most applications, it can be useful to make a distinction between templates that render dynamic content, like say a modal or a new row in a table.  And templates that layout the skeleton of the page.

For instance say you have two basic layouts for your application, one with a sidebar, a navigation bar and a main content area.  Then say you have another layout that has just a main content area and a footer area.  

When constructing the different parts of your page, a naive implementation might be to simply rerender the entire layout each time you go to a new URL.  The problem is that this causes the page to be jumpy as it rerenders.  You don't want the navigation bar to be redrawn every single time you go to a new URL.  You would rather it only be drawn if it's not already there. 

As an example let's say we had the following html snippet, and the same templates that are listed above:

```html
<html>
<body>
  <div id="outlet">
  </div>
</body>
</html>
```

Then we could mount our first layout using the `mount` command:

```js
bone.mount('#outlet', 'layout');
bone.mount('#content', 'table');
bone.mount('#sidebar', 'list', {data: 'hello');
```

The first argument is the `selector` for the HTML element to render the template to.  The second argument is the name of the `template` to use, and the final argument is an optional `options` object.

The `mount` commands above would generate the following HTML:

```html
<html>
<body>
  <div id="outlet">
    <div id="content">
      <table></table>
    </div>
    <div id="sidebar">
      <ul>
        <li>Bone.io</li>
        <li>hello</li>
      </ul>
    </div>
  </div>
</body>
</html>
```

The benefit of this construction is that if we go to another URL and need to restructure the page, then we will only be rerendering the parts of the page that have changed.

For example if we then ran:

```js
bone.mount('#outlet', 'layout');
bone.mount('#content', 'settings');
bone.mount('#sidebar', 'list', {data: 'hello'});
```

Only the `#content` element will have its contents rerendered with the `settings` template.  Which is exactly what we want.

Your mounts should cascade, which is that your highest level DOM nodes need to be mounted first.  In the example above, the `layout` template is attached to the `#outlet` first, before the sub templates.

Typically, you should do this within your routes.  Mounts are not really intended for dynamic data, they are intended to be the skeleton of a page.

If you want to force the contents to update when using the `mount` command, then you can set the `replace` option equal to `true`.

## Logger

By default, bone.io will log activity to the browser's javascript console:

```bash
Inbound:   [eventSpace:action] data         # Data coming into the browser
Outbound:  [eventSpace:action] data         # Data going out of the browser
View:      [selector:action]   data         # DOM manipulation action
Interface: [selector:event]    eventTarget  # DOM events
Route:     [regex:url]                      # URL Route Change
```

This makes it much easier to debug problems and see what actions and events are being triggered across your application.

*__Warning__: You should never run the logger in production, it causes memory leaks.  It is strictly for development purposes.  In production, you need to turn it off:*

```js
bone.set('log', false);
```

## License

©2013 Brad Carleton, Tech Pines LLC and available under the [MIT license](http://www.opensource.org/licenses/mit-license.php):

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in   the Software without restriction, including without limitation the rights to    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies   of the Software, and to permit persons to whom the Software is furnished to do  so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all  copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER          LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE   SOFTWARE.
