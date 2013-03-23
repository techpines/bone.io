
messages = bone.data 'messages'
session = bone.data 'session'

bone.router
    '': (request) ->
        messages.emit 'grab'

bone.view 'display',
    selector: 'ul.display'
    update: (data) ->
        @$el.append("<li>#{data}</li>")

bone.interface 'chat_input',
    selector: 'input.chat'
    click: ->
        value = @$el.val()
        messages.emit 'send', value
        @view.display.update value

messages.incoming
    new: (data, meta) ->
        @view.display.update value
