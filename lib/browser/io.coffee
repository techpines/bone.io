
messageId = 0
contextStore = {}

bone.io = (source, options) ->
    adapter = options.config?.adapter
    adapter ?= 'socket.io'
    bone.io.adapters[adapter] source, options

bone.io.defaults = {}

bone.io.set = (name, value) ->
    bone.io.defaults[name] = value

adapters = bone.io.adapters = {}

adapters['socket.io'] = (source, options) ->
    io = {}
    options.config ?= bone.get('io.options')
    io.error = options.error
    io.source = source
    io.options = options
    io.socket = options.config.socket
    io.inbound = options.inbound
    io.inbound ?= {}
    io.outbound = options.outbound
    io.outbound ?= {}
    io.inbound.middleware ?= []
    io.outbound.middleware ?= []
    io.outbound.routes ?= []
    io.inbound.routes ?= []

    # Setup the outbound routes
    for route in io.outbound.routes
        do (route) ->
            io[route] = (data, context) ->
                context ?= {}
                bone.log "Outbound: [#{source}:#{route}]", data if bone.log?
                context.mid = messageId += 1
                contextStore[context.mid] = context
                bone.async.eachSeries io.outbound.middleware, (callback, next) ->
                    callback data, context, next
                , (error) ->
                    return io.error error if error? and io.error?
                    io.socket.emit "#{source}:#{route}",
                        mid: context.mid
                        data: data

    # Setup the inbound routes
    for name, route of io.inbound
        continue if name is 'middleware'
        do (name, route) ->
            io.socket.on "#{source}:#{name}", (wrapper) ->
                data = wrapper.data
                mid = wrapper.mid
                bone.log "Inbound: [#{source}:#{name}]", data if bone.log?
                context = contextStore[mid]
                delete contextStore[mid]
                context ?= {}
                context.route = name
                context.data = data
                context.namespace = source
                context.socket = io.socket
                bone.async.eachSeries io.inbound.middleware, (callback, next) ->
                    callback data, context, next
                , (error) ->
                    return io.error error if error? and io.error?
                    route.apply io, [data, context]
    return io
