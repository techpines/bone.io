
# Router.coffee - Sets up the bone router

# Convert a route to regex
routeToRegex = (route) ->
    optionalParam = /\((.*?)\)/g
    namedParam = /(\(\?)?:\w+/g
    splatParam = /\*\w+/g
    escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g
    route = route.replace(escapeRegExp, "\\$&")
                 .replace(optionalParam, "(?:$1)?")
                 .replace(namedParam, (match, optional) ->
                    (if optional then match else "([^/]+)")
                 ).replace(splatParam, "(.*?)")
     new RegExp("^" + route + "$")
    
bone.router = (options) ->
    bone.router.handlers ?= []
    $ ->
        for route, action of options.routes
            continue if route is 'routes'
            route = routeToRegex route
            bone.router.handlers.push
                route: route
                callback: options[action]
                router: options
        options.initialize() if options.initialize?

bone.router.start = (options) ->
    bone.$ ->
        bone.history = new bone.History()
        bone.history.handlers = bone.router.handlers
        bone.history.start options

bone.router.navigate = (route, options) ->
    bone.history.navigate route, options


