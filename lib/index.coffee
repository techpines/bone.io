
bone =
    interfaces: {}
    views: {}
    interface: (name, options) ->
        @intefaces[name] = options
        for key, value of options
            continue if key is selector
            $('body').on key, @selector, value
    view: (name, options) ->
        @views[name] = options
    router: (routes) ->
        body.on 'hashchange', (fragment) ->
            for route, callback of routes
                if route is fragment
                    callback()
    use: ->
    data: (source) ->
        @io = io.connect() unless @io?
        return new Data(source)

class Data
    constructor: (source) ->
        @source = source
    
        
