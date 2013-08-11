
# Mount.coffee - Handles mounting of templates to DOM elements

# Setup jquery
$ = bone.$

# Mount a template to a DOM element
bone.mount = (selector, templateName, options) ->
    options ?= {}
    data = options.data
    refresh = options.refresh
    refresh ?= false

    $current = $(selector)
    template = bone.templates[templateName]
    if data?
        templateString = template data
    else
        templateString = template()
    
    if $current.children().length isnt 0
        info = $current.data 'bone-mount'
        sameTemplate = info.template is templateName
        sameData = info.data is data
        if sameTemplate and sameData and not refresh
            return false
        $current.children().remove()
    $current.html templateString
    $current.data 'bone-mount',
        template: templateName
        data: data
    return true
