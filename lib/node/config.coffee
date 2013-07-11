bone = {}
bone.config = exports.config = {}

bone.set = exports.set = (key, value) -> 
    bone.config[key] = value

bone.get = exports.get = (key) ->
    return bone.config[key]
