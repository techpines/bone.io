
# View.coffee - Setup the bone views

initView = (root, view, options) ->
    $root = $(root)
    boneView = {}
    boneView.io = bone.io
    boneView.data = ->
        $root.data.apply $root, arguments
    boneView.$ = ->
        $root.find.apply $root, arguments
    boneView.el = root
    boneView.$el = $root
    for name, action of options
        continue if name is 'events'
        if Object::toString.call(action) isnt '[object Function]'
            boneView[name] = action
            continue
        do (name, action) ->
            boneView[name] = ->
                if bone.log?
                    message = "View: [#{options.selector}:#{name}]"
                    bone.log message, boneView.el, arguments
                action.apply boneView, arguments
    boneView

# Creates a view based on the given CSS selector
bone.view = (selector, options) ->
    view = {}
    options.selector = selector
    events = options.events
    for eventSelector, functionName of events
        continue if functionName is 'events'
        do (eventSelector, functionName) ->
            # Split the event names
            eventSplitter = /^(\S+)\s*(.*)$/
            match = eventSelector.match eventSplitter
            eventName = match[1]
            subSelector = match[2]
            fullSelector = selector
            fullSelector += " #{subSelector}" if subSelector?
            action = options[functionName]
            $ -> $('body').on eventName, fullSelector, (event) ->
                root = $(event.currentTarget).parents(selector)[0]
                root ?= event.currentTarget
                if bone.log?
                    message = "Interface: [#{fullSelector}:#{eventName}]"
                    bone.log message, root
                boneView = $(root).data 'bone-view'
                unless boneView?
                    boneView = initView root, view, options
                    $(root).data 'bone-view', boneView

                if $.trim(selector) isnt $.trim(fullSelector)
                    root = $(fullSelector).parents(selector)[0]
                action.call boneView, event

    for name, action of options
        continue if name is 'events'
        if Object::toString.call(action) isnt '[object Function]'
            view[name] = action
            continue
        do (name, action) ->
            view[name] = ->
                args = arguments
                for element in $(selector)
                    do (element) ->
                        boneView = $(element).data 'bone-view'
                        unless boneView?
                            boneView = initView element, view, options
                            $(element).data 'bone-view'
                        if bone.log?
                            message = "View: [#{selector}:#{name}]"
                            bone.log message, element, args
                        action.apply boneView, args
    return view
