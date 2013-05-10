
// Configure our IO source
bone.io.Listings = bone.io('listings', {
    adapter: 'socket.io',
    options: {
        socket: io.connect()
    },
    
    // Outgoing data route
    outbound: ['search'],

    // Incoming data route
    inbound: {
        results: function(listings) {
            this.view.SearchContainer.refresh(listings);
        }
    }
});

// Here we are defining a bone.io view
// The first argument is a CSS selector specifying which
// elements that this view represents.
// The second argument is the constructor object.
bone.view.SearchContainer = bone.view('.search-container', {

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
        fragment = this.fragment.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
        regex = new RegExp('(' + fragment + ')', 'ig');
        return item.replace(regex, function ($1, match) {
            return '<strong>' + match + '</strong>'
        });
    },

    // Triggers a search
    search: function(root, event) {
        this.fragment = $(root).find('input.search').val();
        if (fragment.length == 0) {
            return this.refresh([]);
        }
        this.io.Listings.search(fragment);
    }
});
