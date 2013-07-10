
bone = module.exports = {}
bone.set = require('./config').set
bone.get = require('./config').get
bone.config = require('./config').config
bone.io = require './io'
bone.io.middleware = require './middleware'
bone.static = require './static'
bone.module = require './module'
