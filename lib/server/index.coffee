
async = require 'async'
bone = module.exports = {}
bone.log = console.log
            
bone.io = (source, options) ->
    bone.io.adapters[options.adapter] source, options

adapters = bone.io.adapters = {}

adapters['socket.io-server'] = (source, options) ->
    sockets = options.options.sockets
    sockets.on 'connection', (socket) ->
        io = {}
        io.error = options.error
        io.source = source
        io.options = options
        io.sockets = sockets
        io.socket = socket
        io.inbound = options.inbound
        io.outbound = options.outbound
        io.inbound.middleware ?= []
        io.outbound.middleware ?= []
        for route in io.outbound
            do (route) ->
                io[route] = (data) ->
                    bone.log "Outbound: [#{source}:#{route}]" if bone.log?
                    socket.emit "#{source}:#{route}", data
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
                    async.each io.inbound.middleware, (callback, next) ->
                        callback data, context, next
                    , (error) ->
                        return io.error error if error? and io.error?
                        route.apply io, [data, context]
