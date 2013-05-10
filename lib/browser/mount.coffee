
# Mount.coffee - Handles mounting of templates to DOM elements

# Setup jquery
$ = bone.$

# Mount a template to a DOM element
bone.mount = (selector, templateName, data, options) ->
    $current = $(selector)
    template = bone.templates[templateName]
    templateString = template data
    
    if $current.children().length isnt 0
        if options.refresh
            return
        $current.children().remove()
    $current.html templateString
