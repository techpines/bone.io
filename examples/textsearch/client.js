
var socket = io.connect(),
    io   = bone.io,
    view = bone.view;

// Configure our IO source
io.Listings = io('listings', {
    adapter: 'socket.io',
    options: {
        socket: socket
    },
    
    // Outgoing data route
    outbound: {
        shortcuts: ['search'],
    },
    // Incoming data route
    inbound: {
        results: function(listings) {
            view.SearchContainer.refresh(listings);
        }
    }
});

// Here we are defining a bone.io view
// The first argument is a CSS selector specifying which
// elements that this view represents.
// The second argument is the constructor object.
view.SearchContainer = view('.search-container', {

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
        
        console.log('hey oh duggy');

        // Iterate through then new listings from the server
        $.each(listings, function(index, listing) {
            
            // Add the listing to the list.
            $('<li>').appendTo($listings)
                     .html(self.highlight(fragment, listing));
        });
    },

    // Highlight individual entries
    highlight: function(fragment, item) {
        var fragment = fragment.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
        regex = new RegExp('(' + fragment + ')', 'ig');
        return item.replace(regex, function ($1, match) {
            return '<strong>' + match + '</strong>'
        });
    },

    // Triggers a search
    search: function(event) {
        this.fragment = this.$('input.search').val();
        if (this.fragment.length == 0) {
            return this.refresh([]);
        }
        io.Listings.search(this.fragment);
    }
});
