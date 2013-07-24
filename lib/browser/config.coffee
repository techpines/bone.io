bone.config = {}

bone.set = (key, value) ->
    if key is 'templates'
        bone.templates = value
    if key is 'log'
        if value is false
            bone.log = undefined
    bone.config[key] = value

bone.get = (key) ->
    return bone.config[key]
