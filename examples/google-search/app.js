
express = require('express.io')
app = express().http().io()
io = app.io

// facts controller
io.route('facts', {
    search: function(req) {
        this.respond([]);
    }
});

app.listen(7076);
