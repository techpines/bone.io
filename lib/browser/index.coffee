
# Index.coffee - Basic setup for the client side bone.io

# Attach the bone object to the window
window.bone = {}

# Set the dom manipulation library, must be jquery
bone.$ = window.$

# Start the history when the dom is ready
bone.$ ->
  bone.history = new bone.History()

# Whether to turn on logging
bone.log = true



            

