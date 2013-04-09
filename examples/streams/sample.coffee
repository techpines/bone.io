
bone.io.route 'some',
    search: (data, context) ->
        @emit('search', data)
        @broadcast 'search' 
