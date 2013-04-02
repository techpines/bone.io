
express = require('express.io')
app = express().http().io()
io = app.io

// listings controller
io.route('listings', {
    search: function(request) {
        request.io.emit('listings:result', []);
    },
});

app.listen(7076);
