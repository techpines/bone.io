
window.bone = {}

bone.view = (selector, options) ->
    view = {}
    events = options.events
    for eventSelector, functionName of events
        # do the bindings
        eventSelector
    for name, action of options
        continue if name is 'events'
        view[name] = (data) ->
            for element in $(selector)
                action element, data
    
    return view
            
bone.io = {}

bone.io.sources = {}

bone.io.get = (source) ->
    socket = bone.io.sources[source]
    return socket if socket?
    socket = io.connect()
    bone.io.sources[source] = socket
    return socket

bone.io.route = (source, actions) ->
    socket = bone.io.get(source)
    for name, action of actions
        socket.on "#{source}:#{name}", action

bone.io.configure (source, options) ->
    # Configure this somehow...

    
