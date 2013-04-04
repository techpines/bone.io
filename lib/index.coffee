
window.bone = {}

eventSplitter = /^(\S+)\s*(.*)$/
slice = Array::slice

setupEvent = (eventName, rootSelector, selector, action) ->

bone.view = (selector, options) ->
    view = {}
    events = options.events
    for eventSelector, functionName of events
        continue if functionName is 'events'
        do (eventSelector, functionName) ->
            match = eventSelector.match eventSplitter
            eventName = match[1]
            subSelector = match[2]
            fullSelector = selector
            fullSelector += " #{subSelector}" if subSelector?
            action = options[functionName]
            $ -> $('body').on eventName, fullSelector, (event) ->
                console.log "Interface: [#{fullSelector}:#{eventName}]", event.currentTarget
                root = $(fullSelector).parents(selector)[0]
                action.call view, root, event

    for name, action of options
        continue if name is 'events'
        do (name, action) ->
            view[name] = (data) ->
                for element in $(selector)
                    do (element) ->
                        console.log "View: [#{selector}:#{name}]", element, data
                        action.call view, element, data
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
        socket.on "#{source}:#{name}", (data) ->
            console.log "Data-In: [#{source}:#{name}]", data
            action data

bone.io.configure = (source, options) ->
    # Configure this somehow...

    
