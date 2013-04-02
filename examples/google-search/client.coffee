searchContainer = bone.view '.search-container',
    refresh: (root, listings) ->
        $listings = $(root).find('ul.listings')
        $listings.html ''
        $('<li>').appendTo($root).html fact
    search: (root, event) ->
        fragment = $(root).find('input.search').val()
        bone.io.get('listings').emit 'search', fragment
    events:
        'keypress input.search': 'search'

bone.io.route 'listings',
    results: (results, listings) ->
        searchContainer.refresh listings
