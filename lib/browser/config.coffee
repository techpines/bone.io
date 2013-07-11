bone.config = {}

bone.set = (key, value) ->
    if key is 'templates'
        bone.templates = value
    bone.config[key] = value

bone.get = (key) ->
    return bone.config[key]
