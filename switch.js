
try {
    module.exports = require('./compiled/node');
} catch(error) {
    // This is just for dev, coffee script is not a hard dependency
    require('coffee-script');
    module.exports = require('./lib/node');
}

