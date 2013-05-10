
bone.io = {}

bone.io.sources = {}

bone.io.get = (source) ->
    socket = bone.io.sources[source]
    return socket if socket?
    socket = io.connect()
    bone.io.sources[source] = socket
    return socket

bone.io.route = (sourceName, actions) ->
    source = bone.io.get(sourceName)
    for name, action of actions
        do (name, action) ->
            source.socket.on "#{sourceName}:#{name}", (data) ->
                if bone.log
                    message = "Data-In: [#{sourceName}:#{name}]"
                    console.log message, data
                action data

bone.io.configure = (source, options) ->
    name = source
    source = bone.io.sources[source] =
        socket: io.connect()
    for action in options.actions
        do (action) ->
            source[action] = (data) ->
                console.log "Data-Out: [#{name}:#{action}]", data if bone.log
                source.socket.emit "#{name}:#{action}", data
