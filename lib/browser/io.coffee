
messageId = 0
contextStore = {}

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
    io.inbound ?= {}
    io.outbound = options.outbound
    io.outbound ?= {}
    io.inbound.middleware ?= []
    io.outbound.middleware ?= []
    io.outbound.shortcuts ?= []
    io.inbound.shortcuts ?= []

    # Setup the outbound shortcuts
    for route in io.outbound.shortcuts
        do (route) ->
            io[route] = (data, context) ->
                bone.log "Outbound: [#{source}:#{route}]", data if bone.log?
                data._messageId = messageId += 1
                contextStore[data._messageId] = context
                io.socket.emit "#{source}:#{route}", data

    # Setup the inbound routes
    for name, route of io.inbound
        continue if name is 'middleware'
        do (name, route) ->
            io.socket.on "#{source}:#{name}", (data) ->
                bone.log "Inbound: [#{source}:#{name}]", data if bone.log?
                context = contextStore[data._messageId]
                delete contextStore[data._messageId]
                context ?= {}
                context.route = name
                context.data = data
                bone.async.eachSeries io.inbound.middleware, (callback, next) ->
                    callback data, context, next
                , (error) ->
                    return io.error error if error? and io.error?
                    route.apply io, [data, context]
    return io
