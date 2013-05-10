
// Configure our data source
bone.io.configure('listings', {
    adapter: 'socket.io-client',
    actions: ['search']
});

// Here we are defining a bone.io view
// The first argument is a CSS selector specifying which
// elements that this view represents.
// The second argument is the constructor object.
window.searchContainer = bone.view('.search-container', {

    // Simple events hash
    events: {
        'keyup input.search': 'search',
        'click .searchBtn': 'search'
    },

    // Refresh search results
    refresh: function(listings) {
        var self = this;

        // Grab the listings box
        var $listings = self.$('ul.listings');
    
        // Empty the listings box
        $listings.html('');
        
        // Iterate through then new listings from the server
        $.each(listings, function(index, listing) {
            
            // Add the listing to the list.
            $('<li>').appendTo($listings)
                     .html(self.highlight(listing));
        });
    },

    // Highlight individual entries
    highlight: function(item) {
        var fragment = this.data('fragment');
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
        this.data('fragment', fragment);
        bone.io.get('listings').search(fragment);
    }
});

// Incoming data route
bone.io.route('listings', {
    results: function(listings) {
        return searchContainer.refresh(listings);
    }
});

