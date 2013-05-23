
async = require 'async'
bone = module.exports = {}
#bone.log = console.log
            
bone.io = (source, options) ->
    bone.io.adapters[options.adapter] source, options

adapters = bone.io.adapters = {}

createIO = (socket, options, type) ->
    io = {}
    source = options.source
    io.error = options.error
    io.source = options.source
    io.options = options
    io.sockets = options.options.sockets
    io.socket = socket
    io.inbound = options.inbound
    io.inbound ?= {}
    io.outbound = options.outbound
    io.outbound ?= {}
    io.inbound.middleware ?= []
    io.outbound.middleware ?= []
    io.outbound.shortcuts ?= []
    for route in io.outbound.shortcuts
        do (route) ->
            io[route] = (data, context) ->
                if context?
                    data._messageId = context._messageId
                bone.log "Outbound: [#{source}:#{route}]" if bone.log?
                socket.emit "#{source}:#{route}", data
    return io if type is 'all'
    for name, route of io.inbound
        continue if name is 'middleware'
        do (name, route) ->
            io.socket.on "#{source}:#{name}", (data) ->
                bone.log "Inbound: [#{source}:#{name}]" if bone.log?
                context =
                    cookies: socket.handshake.cookies
                    socket: socket
                    headers: socket.handshake.headers
                    handshake: socket.handshake
                    action: name
                    _messageId: data._messageId
                delete data._messageId
                async.eachSeries io.inbound.middleware, (callback, next) ->
                    callback data, context, next
                , (error) ->
                    return io.error error if error? and io.error?
                    route.apply io, [data, context]
    return io

adapters['socket.io'] = (source, options) ->
    options.source = source
    sockets = options.options.sockets
    sockets.on 'connection', (socket) ->
        createIO socket, options, 'single'
    return createIO sockets, options, 'all'
