
var socket = io.connect(),
    io   = bone.io,
    view = bone.view;

// Configure our IO source
io.LiveReload = io('live-reload', {
    adapter: 'socket.io',
    options: {
        socket: socket
    },
    inbound:  {
        cssChanged: function(css) {
            console.log('hey oh');
            $('link').remove();
            $('style').remove();
            $('head').append($('<style>'));
            $('style').html(css);
        }
    },
});

