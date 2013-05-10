
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
* [Supports](http://bone.io) - Supports provide a system for building the structure of a page.
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
bone.view.SomeView = bone.view('.some-awesome-selector', {

    // This is the events hash, similar to backbone.js.
    // You map user interface events to functions of the view.
    events: {
        'click': 'close'
    },

    // Dom manipulation actions pass
    // data along as the first argument.
    render: function(data) {
    },

    // User interface actions pass
    // the jquery event and then data.
    close: function(event, data) {
        this.$el.hide();
    },
});
```

You might be wondering, how is this different than Backbone.js?  In bone.io the views are based on "selectors".  Every element that matches the selector will exhibit the same behavior.  This works whether there are 3 elements or 10 elements or 0 elements or it switches between all different numbers of elements.  Bone.io just works.  So no more manually creating and destroying views all over the place, and having zombie views ruin your picnics.




## Realtime Data, just say not to Models

Models are a great concept, and they are certainly helpful in many situations, unfortunately they are usually overkill for most applications.

Now that we have websockets, a lot of times we want "hot" data plugged directly into the DOM.  A model abstraction is nice but it obfuscates the fusing of hot data directly into the DOM.

For this reason, we introduce the concept of data routes, and we cleverly separate incoming from outgoing data.

```js
app.io.configure('my-data-source', {
    actions: ['search', 'destroy', 'alert', 'error']
    adapter: 'socket.io'
});





