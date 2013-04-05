
isLoading = false;
page= 1;


var searchContainer = bone.view('.search-container', {
    events: {
        'keyup input.search': 'search',
        'click .searchBtn': 'search',
        'scroll': 'checkScroll'
    },
    refresh: function(root, tweets) {
        var self = this;
        var $tweets = $(root).find('.tweets');

        $.each(tweets, function(index, tweets) {
        var text = self.highlight(tweets.text)
        var prof = "<img src='"+tweets.profile_image_url+"' />"
        var username = "<h4>"+tweets.from_user+"</h5>"

        $('<div class="tweet">').appendTo($tweets).html(prof+username+text);

        });
    },

checkScroll: function() {

console.log('checking');

    var $searchContainer = $(root).find('.search-container');
 var triggerPoint = 100; // 100px from the bottom
        if( !this.isLoading && searchContainer.scrollTop + searchContainer.clientHeight + triggerPoint > searchContainer.scrollHeight ) {
          page += 1; // Load next page
          console.log('load next page')
          this.loadMoreResults();
        }

}, loadMoreResults: function()
{

        var fragment = $(root).find('input.search').val();
        $(root).data('fragment', fragment);
        var dataSend = new Object();
        dataSend.fragment = fragment;
        dataSend.page= page;
        bone.io.get('listings').emit('listings:search', dataSend);

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
        page = 1
        var $tweets = $(root).find('.tweets');
        $tweets.html('');
        var fragment = $(root).find('input.search').val();
        if (fragment.length == 0) {
            return searchContainer.refresh([]);
        }
        $(root).data('fragment', fragment);
        var dataSend = new Object();
        dataSend.fragment = fragment;
        dataSend.page= page;
        bone.io.get('listings').emit('listings:search', dataSend);
    }
});

bone.io.route('listings', {
    results: function(listings) {
        return searchContainer.refresh(listings);
    }
});

