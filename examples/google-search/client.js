
var searchContainer = bone.view('.search-container', {
    refresh: function(root, listings) {
        var $listings;
        $listings = $(root).find('ul.listings');
        $listings.html('');
        return $('<li>').appendTo($root).html(fact);
    },
    search: function(root, event) {
        var fragment;
        fragment = $(root).find('input.search').val();
        return bone.io.get('listings').emit('search', fragment);
    },
    events: {
        'keypress input.search': 'search'
    }
});

bone.io.route('listings', {
    results: function(results, listings) {
        return searchContainer.refresh(listings);
    }
});

