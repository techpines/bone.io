
# Tutorial: Creating your first View

Let's start with a basic HTML page and see how bone.io helps manage events and DOM manipulations for us.

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script src="/socket.io/socket.io.js"></script>
<script src="/bone.io.js?path=../../bone.io.js"></script>
<script>

// We'll be putting our view code here.

</script>
<body>
  <a href="http://google.com">
  <a href="http://facebook.com">
  <a href="http://twitter.com>">
  <button class="deactivate">
</body>
```

So here is how we can setup a view for all "a" tags:

```js

var view = bone.view;

view.Links = view('a', {
    events: {
        'click': 'activate'
    },
    activate: function(event) {
        event.preventDefault();
        if (this.$el.hasClass('active')) {
            window.location.href = this.$el.attr('href');
        } else {
            this.$el.addClass('activate'); 
        } 
    }
});
```



