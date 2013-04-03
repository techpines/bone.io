
var searchContainer = bone.view('.search-container', {
    events: {
        'keyup input.search': 'search'
    },
    refresh: function(root, listings) {
        var self = this;
        var $listings = $(root).find('ul.listings');
        $listings.html('');
        $.each(listings, function(index, listing) {
            $('<li>').appendTo($listings)
                     .html(self.highlight(listing));
        });
    },
    highlight: function(root, item) {
        var fragment = $(root).data('fragment');
        fragment = fragment.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
        regex = new RegExp('(' + fragment + ')', 'ig');
        return item.replace(regex, function ($1, match) {
            return '<strong>' + match + '</strong>'
        });
    },
    search: function(root, event) {
        var fragment = $(root).find('input.search').val();
        if (fragment.length == 0) {
            return searchContainer.refresh([]);
        }
        $(root).data('fragment', fragment);
        bone.io.get('listings').emit('listings:search', fragment);
    }
});

bone.io.route('listings', {
    results: function(listings) {
        return searchContainer.refresh(listings);
    }
});

