
// Configure our data source
bone.io.configure('listings', {
    adapter: 'socket.io-client',
    actions: ['search']
});

// Here we are defining a bone.io view
var searchContainer = bone.view('.search-container', {

    // Simple events hash
    events: {
        'keyup input.search': 'search',
        'click .searchBtn': 'search'
    },

    // Refresh search results
    refresh: function(root, listings) {
        var self = this;
        var $listings = $(root).find('ul.listings');
        $listings.html('');
        $.each(listings, function(index, listing) {
            $('<li>').appendTo($listings)
                     .html(self.highlight(listing));
        });
    },

    // Highlight individual entries
    highlight: function(root, item) {
        var fragment = $(root).data('fragment');
        fragment = fragment.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
        regex = new RegExp('(' + fragment + ')', 'ig');
        return item.replace(regex, function ($1, match) {
            return '<strong>' + match + '</strong>'
        });
    },

    // Triggers a search
    search: function(root, event) {
        var fragment = $(root).find('input.search').val();
        if (fragment.length == 0) {
            return searchContainer.refresh([]);
        }
        $(root).data('fragment', fragment);
        bone.io.get('listings').search(fragment);
    }
});

// Incoming data route
bone.io.route('listings', {
    results: function(listings) {
        return searchContainer.refresh(listings);
    }
});

