
This ain't no meteor man, this is some bone.io

![bone.io](http://cdn.techpines.io/bone-io-github.png)

# Features

1. Ready for production
1. Similar api to backbone.js
1. No more creating and destroying views
1. Based on websockets, forget ajax
1. Middleware for everything
1. Not MVC!

# Philosophy

It's time to take a radically new approach to client side application development.  Frameworks like Bacbone.js, Knockout and others have made great strides in adding the necessary structure to make complex client side applications, but they all have serious problems.

Instead of taking the approach of listening to events.  We decided on a different architecture.  We divide a client side application into 5 separate actions:

* Routes: Client side routes are actions that use HTML5 push state with dropback to hashbang.
* Data-In: Websocket data travelling to the client.
* Data-Out: Websocket data travelling to the server.
* Interface: User/System Generated events.
* Actions: Events that manipulate the DOM.

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
* [Supports](http://bone.io) - Supports provide a system for building the structure of a page.
* [IO](http://bone.io) - Input/Output handles bi-directional data communication with various endpoints.

This is not an MVC framework!  There is no model, if you need to maintain state on the browser, we recommend that you use the browser sessions.

### On the Server

You can install the library with npm:

```bash
npm install bone.io
```

On the server side you can just require it:

```js
var bone = require('bone.io');
```

Currently, the only server side component is for IO:

* [IO](http://bone.io) - Input/Output handles bi-directional data communication with connected devices.

## Views

A view in bone.io is based on a `selector`.  They are easy to declare, and they take care of two major components of our frontend applications.  Namely handling user generated events like clicks and keyups, and also manipulating the DOM.

```js
var MyCoolView = bone.view '.some-awesome-selector', {
    // This is the events hash, similar to backbone.js
    // You declaritevly state how user interface events
    // map to functions of the view.
    events:
        'click': 'close'
    // Dom manipulation actions pass
    // the root dom element and any
    // data that the caller wishes to pass.
    render: function(data) {
    },
    // User interface actions are passed
    // the root dom element and the 
    // jQuery event object for the action.
    close: function(event, data) {
    },
}
```

Whenever you call actions you don't need to supply the `root` argument.  This is generated automatically.  You can override the root element by providing your own.

The reason for this, is that these actions are not occurring on a single element, they are occurring on every element that matches the selector.  This fact makes the declarative styling very appealing. You don't have to manually manage the creation and deletion of views.

## Realtime Data, just say not to Models

Models are a great concept, and they are certainly helpful in many situations, unfortunately they are usually overkill for most applications.

Now that we have websockets, a lot of times we want "hot" data plugged directly into the DOM.  A model abstraction is nice but it obfuscates the fusing of hot data directly into the DOM.

For this reason, we introduce the concept of data routes, and we cleverly separate incoming from outgoing data.

```js
app.io.configure('my-data-source', {
    actions: ['search', 'destroy', 'alert', 'error']
    adapter: 'socket.io'
});





