
# Index.coffee - Basic setup for the browser

# Setup the bone object
bone = {}

# Setup modules
bone.modules = {}

# Attach bone to the window or exports
if module?.exports?
    module.exports = bone
else
    window.bone = bone

# Set the dom manipulation library, must be jquery
bone.$ = window.$

bone.log = undefined

# Default logging set to console.log, also only if it is running on localhost
if window.console?.log? and window.location.href.indexOf('localhost') isnt -1
    bone.log = (message) ->
        console.log message
