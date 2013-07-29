
async = require 'async'

bone = {}
bone.get = require('./config').get
            
bone.io = module.exports = (source, options) ->
    adapter = options.config?.adapter
    adapter ?= 'socket.io'
    bone.io.adapters[adapter] source, options

bone.io.defaults = {}

bone.io.set = (name, value) ->
    bone.io.defaults[name] = value

adapters = bone.io.adapters = {}

createIO = (socket, options, type) ->
    io = {}
    io.room = (socket) ->
        createIO socket, options
    io.socket = socket
    io.sockets = options.config.server.sockets
    io.source = options.source
    if typeof socket is 'string' or typeof socket is 'number'
        type = 'room'
        io.socket = io.sockets.in "#{options.source}:#{socket.toString()}"
    source = options.source
    io.error = options.error
    io.options = options
    io.inbound = options.inbound
    io.inbound ?= {}
    io.outbound = options.outbound
    io.outbound ?= {}
    io.inbound.middleware ?= []
    io.outbound.middleware ?= []
    io.outbound.routes ?= []
    io.join = (room) ->
        io.socket.join "#{source}:#{room}"
    io.leave = (room) ->
        io.socket.leave "#{source}:#{room}"
    for route in io.outbound.routes
        do (route) ->
            io[route] = (data, context) ->
                context ?= {}
                bone.log "Server-Outbound: [#{source}:#{route}]" if bone.log?
                async.eachSeries io.outbound.middleware, (callback, next) ->
                    callback data, context, next
                , (error) ->
                    return io.error error if error? and io.error?
                    io.socket.emit "#{source}:#{route}",
                        data: data
                        mid: context.mid
    return io if type is 'all' or type is 'room'
    
    for name, route of io.inbound
        continue if name is 'middleware'
        do (name, route) ->
            io.socket.on "#{source}:#{name}", (wrapper) ->
                data = wrapper.data
                mid = wrapper.mid
                bone.log "Server-Inbound: [#{source}:#{name}]" if bone.log?
                context =
                    route: name
                    data: data
                    namespace: source
                    socket: socket
                    headers: socket.handshake.headers
                    handshake: socket.handshake
                    mid: mid
                async.eachSeries io.inbound.middleware, (callback, next) ->
                    callback data, context, next
                , (error) ->
                    return io.error error if error? and io.error?
                    route.apply io, [data, context]
    return io

adapters['socket.io'] = (source, options) ->
    options.source = source
    unless options.config?
        options.config = bone.get('io.options')
    unless options.config?.server?
        throw new Error 'The Bone.io IO "socket.io" adapter needs a socket.io server!  You must at least provide {config: server: io} from socket.io.  Cheers!'
    sockets = options.config.server.sockets
    sockets.on 'connection', (socket) ->
        createIO socket, options
    return createIO sockets, options, 'all'
