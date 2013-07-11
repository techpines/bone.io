bone.config = {}

bone.set = (key, value) ->
    bone.config[key] = value

bone.get = (key) ->
    return bone.config[key]
