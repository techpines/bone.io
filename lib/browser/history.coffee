
# History.coffee - Handles cross-browser history management, based on either
# [pushState](http://diveintohtml5.info/history.html) and real URLs, or
# [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
# and URL fragments. If the browser supports neither (old IE, natch),
# falls back to polling.

# Code is mostly borrowed from backbone, so Copyright Backbone.js

# Define an extend function
extend = (obj) ->
  for source in Array.prototype.slice.call(arguments, 1)
    if source
      for prop of source
        obj[prop] = source[prop]

  obj

# Cached regex for stripping a leading hash/slash and trailing space.
routeStripper = /^[#\/]|\s+$/g

# Cached regex for stripping leading and trailing slashes.
rootStripper = /^\/+|\/+$/g

# Cached regex for detecting MSIE.
isExplorer = /msie [\w.]+/

# Cached regex for removing a trailing slash.
trailingSlash = /\/$/

# Set up all inheritable **Backbone.History** properties and methods.
class bone.History
  constructor: ->
    # Ensure that `History` can be used outside of the browser.
    if typeof window isnt "undefined"
      @location = window.location
      @history = window.history

  # The default interval to poll for hash changes, if necessary, is
  # twenty times a second.
  interval: 50
  
  # Gets the true hash value. Cannot use location.hash directly due to bug
  # in Firefox where location.hash will always be decoded.
  getHash: (window) ->
    match = (window or this).location.href.match(/#(.*)$/)
    (if match then match[1] else "")

  
  # Get the cross-browser normalized URL fragment, either from the URL,
  # the hash, or the override.
  getFragment: (fragment, forcePushState) ->
    unless fragment?
      if @_hasPushState or not @_wantsHashChange or forcePushState
        fragment = @location.pathname
        root = @root.replace(trailingSlash, "")
        fragment = fragment.substr(root.length)  unless fragment.indexOf(root)
      else
        fragment = @getHash()
    fragment.replace routeStripper, ""

  
  # Start the hash change handling, returning `true` if the current URL matches
  # an existing route, and `false` otherwise.
  start: (options) ->
    
    # Figure out the initial configuration. Do we need an iframe?
    # Is pushState desired ... is it available?
    @options = extend({},
      root: "/"
    , @options, options)
    @root = @options.root
    @_wantsHashChange = @options.hashChange isnt false
    @_wantsPushState = !!@options.pushState
    @_hasPushState = !!(@options.pushState and @history and @history.pushState)
    fragment = @getFragment()
    docMode = document.documentMode
    oldIE = (isExplorer.exec(navigator.userAgent.toLowerCase()) and (not docMode or docMode <= 7))
    
    # Normalize root to always include a leading and trailing slash.
    @root = ("/" + @root + "/").replace(rootStripper, "/")
    if oldIE and @_wantsHashChange
      @iframe = bone.$("<iframe src=\"javascript:0\" tabindex=\"-1\" />").hide().appendTo("body")[0].contentWindow
      @navigate fragment
    
    # Depending on whether we're using pushState or hashes, and whether
    # 'onhashchange' is supported, determine how we check the URL state.
    if @_hasPushState
      bone.$(window).on "popstate", =>
        @checkUrl.apply this, arguments
    else if @_wantsHashChange and ("onhashchange" of window) and not oldIE
      bone.$(window).on "hashchange", =>
        @checkUrl.apply this, arguments
    else @_checkUrlInterval = setInterval(@checkUrl, @interval)  if @_wantsHashChange
    
    # Determine if we need to change the base url, for a pushState link
    # opened by a non-pushState browser.
    @fragment = fragment
    loc = @location
    atRoot = loc.pathname.replace(/[^\/]$/, "$&/") is @root
    
    # If we've started off with a route from a `pushState`-enabled browser,
    # but we're currently in a browser that doesn't support it...
    if @_wantsHashChange and @_wantsPushState and not @_hasPushState and not atRoot
      @fragment = @getFragment(null, true)
      @location.replace @root + @location.search + "#" + @fragment
      
      # Return immediately as browser will do redirect to new url
      return true
    
    # Or if we've started out with a hash-based route, but we're currently
    # in a browser where it could be `pushState`-based instead...
    else if @_wantsPushState and @_hasPushState and atRoot and loc.hash
      @fragment = @getHash().replace(routeStripper, "")
      @history.replaceState {}, document.title, @root + @fragment + loc.search
    @loadUrl()  unless @options.silent

  
  # Add a route to be tested when the fragment changes. Routes added later
  # may override previous routes.
  route: (route, callback) ->
    @handlers.unshift
      route: route
      callback: callback


  
  # Checks the current URL to see if it has changed, and if it has,
  # calls `loadUrl`, normalizing across the hidden iframe.
  checkUrl: (e) ->
    current = @getFragment()
    current = @getFragment(@getHash(@iframe))  if current is @fragment and @iframe
    return false  if current is @fragment
    @navigate current  if @iframe
    @loadUrl() or @loadUrl(@getHash())

  handlers: []

  loadUrl: (fragmentOverride) ->
    fragment = @fragment = @getFragment(fragmentOverride)
    for handler in @handlers
        if handler.route.test fragment
            args = handler.route.exec(fragment).slice 1
            if bone.log?
                bone.log "Route: [#{handler.route}:#{fragment}]", args
            handler.router.middleware ?= []
            bone.async.eachSeries handler.router.middleware, (callback, next) ->
                callback.apply handler.router, [fragment, next]
            , ->
                handler.callback.apply handler.router, args
            return true
  
  # Save a fragment into the hash history, or replace the URL state if the
  # 'replace' option is passed. You are responsible for properly URL-encoding
  # the fragment in advance.
  #
  # The options object can contain `trigger: true` if you wish to have the
  # route callback be fired (not usually desirable), or `replace: true`, if
  # you wish to modify the current URL without adding an entry to the history.
  navigate: (fragment, options) ->
    options = trigger: options  if not options or options is true
    fragment = @getFragment(fragment or "")
    return  if @fragment is fragment
    @fragment = fragment
    url = @root + fragment
    
    # If pushState is available, we use it to set the fragment as a real URL.
    if @_hasPushState
      @history[(if options.replace then "replaceState" else "pushState")] {}, document.title, url
    
    # If hash changes haven't been explicitly disabled, update the hash
    # fragment to store history.
    else if @_wantsHashChange
      @_updateHash @location, fragment, options.replace
      if @iframe and (fragment isnt @getFragment(@getHash(@iframe)))
        
        # Opening and closing the iframe tricks IE7 and earlier to push a
        # history entry on hash-tag change.  When replace is true, we don't
        # want this.
        @iframe.document.open().close()  unless options.replace
        @_updateHash @iframe.location, fragment, options.replace
    
    # If you've told us that you explicitly don't want fallback hashchange-
    # based history, then `navigate` becomes a page refresh.
    else
      return @location.assign(url)
    @loadUrl fragment  if options.trigger

  
  # Update the hash location, either replacing the current entry, or adding
  # a new one to the browser history.
  _updateHash: (location, fragment, replace) ->
    if replace
      href = location.href.replace(/(javascript:|#).*$/, "")
      location.replace href + "#" + fragment
    else
      
      # Some browsers require that `hash` contains a leading #.
      location.hash = "#" + fragment
