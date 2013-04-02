
bone.io.configure 'listings',
    io: 'ws://twitter.com/websockets'
    localStorage: 'cache'


searchContainer = bone.view '.search-container',
    refresh: (root, listings) ->
        $listings = $(root).find('ul.listings')
        $listings.html ''
        $('<li>').appendTo($root).html fact
    search: (root) ->
        fragment = $(root).find('input.search').val()
        bone.io.get('listings').emit 'search', fragment
    events:
        'keypress input.search': 'search'
        'click button.search': 'search'

bone.io.route 'listings',
    results: (results, listings) ->
        searchContainer.refresh listings
        

