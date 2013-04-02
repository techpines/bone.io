$(function() {

var searchContainer = bone.view('.search-container', {
    refresh: function(root, listings) {
        var $listings;
        $listings = $(root).find('ul.listings');
        $listings.html('');
        $.each(listings, function(index, listing) {
            $('<li>').appendTo($listings).html(listing);
        });
    },
    search: function(root, event) {
        var fragment;
        fragment = $(root).find('input.search').val();
        bone.io.get('listings').emit('listings:search', fragment);
    },
    events: {
        'keyup input.search': 'search'
    }
});

bone.io.route('listings', {
    results: function(listings) {
        return searchContainer.refresh(listings);
    }
});

});
