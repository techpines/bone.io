
bone.io = (source, options) ->
    adapters[options.adapter] source, options

adapters = bone.io.adapters = {}

adapters['socket.io'] = (source, options) ->
    io = {}
    io.error = options.error
    io.source = source
    io.options = options
    io.socket = options.options.socket
    io.inbound = options.inbound
    io.outbound = options.outbound
    io.inbound.middleware ?= []
    io.outbound.middleware ?= []

    for route in io.outbound
        do (route) ->
            io[route] = (data, context) ->
                bone.log "Outbound: [#{source}:#{route}]", data if bone.log?
                io.socket.emit "#{source}:#{route}", data

    for name, route of io.inbound
        continue if name is 'middleware'
        do (name, route) ->
            io.socket.on "#{source}:#{name}", (data) ->
                bone.log "Inbound: [#{source}:#{name}]", data if bone.log?
                context = {}
                bone.async.each io.inbound.middleware, (callback, next) ->
                    callback data, context, next
                , (error) ->
                    return io.error error if error? and io.error?
                    route.apply io, [data, context]

    return io
