
async = require 'async'

bone = {}
console.log 'in the bone'
            
bone.io = module.exports = (source, options) ->
    adapter = options.config?.adapter
    adapter ?= 'socket.io'
    bone.io.adapters[adapter] source, options

bone.io.defaults = {}

bone.io.set = (name, value) ->
    bone.io.defaults[name] = value

adapters = bone.io.adapters = {}

createIO = (socket, options, type) ->
    io = (socket) ->
        createIO socket, options
    io.socket = socket
    io.sockets = options.config.server.sockets
    io.source = options.source
    if typeof socket is 'string' or typeof socket is 'number'
        console.log 'we got here!'
        type = 'room'
        console.log io.sockets
        console.log io.socket
        io.socket = io.sockets.in "#{options.source}:#{socket.toString()}"
        console.log io.socket
    source = options.source
    io.error = options.error
    io.options = options
    io.inbound = options.inbound
    io.inbound ?= {}
    io.outbound = options.outbound
    io.outbound ?= {}
    io.inbound.middleware ?= []
    io.outbound.middleware ?= []
    io.outbound.shortcuts ?= []
    io.join = (room) ->
        console.log 'we are about to join ' + room
        io.socket.join "#{source}:#{room}"
    for route in io.outbound.shortcuts
        do (route) ->
            io[route] = (data, context) ->
                if context?
                    data._messageId = context._messageId
                bone.log "Outbound: [#{source}:#{route}]" if bone.log?
                console.log io.socket
                io.socket.emit "#{source}:#{route}", data
    return io if type is 'all' or type is 'room'
    console.log 'binding events for our socket capn'
    console.log type
    
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
    unless options.config?
        options.config = bone.io.defaults.config
    unless options.config?.server?
        throw new Error 'The Bone.io IO "socket.io" adapter needs a socket.io server!  You must at least provide {config: server: io} from socket.io.  Cheers!'
    sockets = options.config.server.sockets
    sockets.on 'connection', (socket) ->
        createIO socket, options
    return createIO sockets, options, 'all'
