
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

# Start the history when the dom is ready
bone.$ ->
  bone.history = new bone.History()

# Default logging set to console.log
if window.console?.log?
    bone.log = ->
        console.log.apply console, arguments
