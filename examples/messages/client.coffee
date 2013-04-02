
chatBox = bone.view '.chat-box',
    updateChats: (root) ->

    sendChat: (root) ->

    events:
        'keypress': 'sendChat'

bone.io.route 'messages',
    new: (message) ->
        chatBox.updateChats message


