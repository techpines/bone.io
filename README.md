
Realtime browser/server framework

![bone.io](http://cdn.techpines.io/bone-io-github.png)

# Getting Started

Bone.io is mainly a client side framework, however there is a also a server side component for api consistency.


### In the Browser

To install the browser library, just include "bone.io.js" and the two dependencies in your html:

```html
<script src="/jquery.js"></script>
<script src="/socket.io/socket.io.js"></script>
<script src="/bone.io.js"></script>
```

Bone.io depends on jquery for DOM manipulation, and socket.io for realtime websockets.

Here are a list of the browser components:

* [View](http://bone.io) - A view is based on a CSS selector and handles DOM events and DOM manipulations.
* [Router](http://bone.io) - A router executes routes based on client side url changes.
* [Mounts](http://bone.io) - Mounts provide a system for building the structure of a page.
* [IO](http://bone.io) - Input/Output handles bi-directional data communication with various endpoints.

This is not an MVC framework!  There is no model, if you need to maintain state on the browser, we recommend that you use the browser sessions.

### On the Server

You can install the library with npm:

```bash
npm install bone.io
```

On the server you can just require it:

```js
var bone = require('bone.io');
```

Currently, the only server side component is for IO:

* [IO](http://bone.io) - Input/Output handles bi-directional data communication with connected devices.

## Views

A view in bone.io is based on a `selector`.  They are easy to declare, and they take care of DOM manipulations and user generated events.

```js
bone.view.SomeView = bone.view('tr.data-row', {

    events: {
        'click .icon': 'open': 
        'click .button.edit': 'edit',
        'click .button.delete': 'remove'
    },

    remove: function() {
        this.$el.remove();
    },

    edit: function() {
        ...
    }

});
```

You might be wondering, how is this different than Backbone.js?  In bone.io the views are based on "selectors".  Every element that matches the selector will exhibit the same behavior.  This works whether there are 3 elements or 10 elements or 0 elements or it switches between all different numbers of elements.  Bone.io just works.  So no more manually creating and destroying views all over the place, and having zombie views ruin your picnics.

Similar to backbone.js, views have a few handy properties attached to `this`:

* `el` - The dom element for the current action.
* `$el` - The jquery element for the current action.
* `$` - Short hand for `this.$el.find`, because scoping is good.
* `data` - Store and retrieve data on the element shortcut for `$this.$el.data`.

# Router

The router in bone.io is very similar to Backbone.js:

```js
bone.router.Router = bone.router({

    routes: {
        "help":                 "help",    // #help
        "search/:query":        "search",  // #search/bones
        "search/:query/p:page": "search"   // #search/bones/p7
    },

    middleware: [
        bone.router.middleware.session,
        bone.router.middleware.authenticate({
            redirect: '/login'
        })
    ]

    help: function() {
        ...
    },

    search: function(query, page) {
        ...
    }
});
```

The main difference is that the router supports the concept of middleware.  There are two router middleware classes.

* bone.router.middleware.session
* bone.router.middleware.authenticate

# Mounts

To use supports, you need to set your templates.  To set templates for bone, you need to do the following:

```js
bone.templates = {
    layout: function() { return '<div id="content"></div><div id="sidebar"></div>'},
    table: function() { return '<table></table>'},
    list: function(data) { return '<ul><li>Bone.io</li><li>'+data+'</ul>'}
};
```

The templating language is up to you, but it must be compiled to javascript functions.

Then you can setup your supports:

```js
bone.support('body', 'layout');
bone.support('#content', 'table');
bone.support('#sidebar', 'list', data);
```

You should do this within your routes.  Mounts are not intended for dynamic data, they are intended to be the static skeleton.

Mounts are based on a single DOM element, and they are also smart.  They remove existing DOM elements using jquery `remove` before doing their append.  They also will not render twice by default, this keeps your page from being jerky if you specify a certain sidebar element in several routes but not all of them.

# IO

Input/Output is one of the cool new features of bone.io.  First you have to define an io source:

```js
bone.io.Search = bone.io('search', {
    adapter: 'socket.io',
    options: {
        socket: io.connect()
    },
    middlware: [
        bone.io.middleware.session
    ],
    outbound: ['results'],
    inbound: {
        results: function(data, context) {
            ...
        }
    }
});
```

The `adapter` tells bone.io what type of adapter is being used.  Currently only socket.io is supported.  The options object gives options for the adapter.  The `actions` give the names of functions that can be called on the IO object to make server calls.  For the socket.io adapter by default, these will be simple `socket.emit` calls.

You can also use middleware.  Middleware should define two functions `input` and `output`.  To be run for incoming data and outgoing data respectively.

