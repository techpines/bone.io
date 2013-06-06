
bone = {}
bone.static = require('./static')

bone.module = module.exports = (name, path, register) ->
    if register?
        bone.static.add path
    else
        register = path
    bone.module[name] = register
