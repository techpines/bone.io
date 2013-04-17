
async = require 'async'
bone = module.exports = {}
bone.io = {}
bone.io.sources = {}
bone.io.adapters = {}

# Simple register adapters code
bone.io.register = (adapter, callback) ->
    bone.io.adapters[adapter] = callback

# Register the adapter for a socket.io server
bone.io.register 'socket.io-server', (source, options, actions) ->

    options.outgoing ?= []
    options.incoming ?= []

    # Socket.io servers are configured on the connection event
    options.io.sockets.on 'connection', (socket) ->
        
        # Define an object for this socket
        self = {}
            
        # Bind actions to self
        for action in options.actions
            do (action) ->
                async.series options.outgoing, (error) ->
                    return bone.io.error error if error
                    self[action] = (data) ->
                        socket.emit "#{source}:#{action}", data
    
        # Setup the callbacks for incoming routes
        for key, callback of actions
            socket.on "#{source}:#{key}", (data) ->
                context =
                    cookies: socket.handshake.cookies
                    socket: socket
                    headers: socket.handshake.headers
                    handshake: socket.handshake
                do (callback) ->
                    async.series options.incoming, (error) ->
                        return bone.io.error error if error?
                        callback.apply self, [data, context]
            
bone.io.configure = (source, options) ->
    bone.io.sources[source] = options: options
    if options.noIncoming
        adapter = bone.io.adapters[options.adapter]
        adapter source, options

bone.io.route = (source, actions) ->
    dataSource = bone.io.sources[source]
    adapter = bone.io.adapters[dataSource.options.adapter]
    adapter source, dataSource.options, actions
