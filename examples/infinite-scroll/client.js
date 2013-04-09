
curSearch = null;
searchTerm = "";

tweetsFoundSoFar = new Array()

var searchContainer = bone.view('.search-container', {
    events: {

        'click .searchBtn': 'newSearch',
        'click .stopBtn' : 'stopSearch'

    },
    refresh: function(root, tweets) {
        var self = this;
        var $tweets = $(root).find('.tweets');

        $.each(tweets, function(index, tweets) {

if($.inArray(tweets.id, tweetsFoundSoFar) === -1)
{

        var text = self.highlight(tweets.text)
        var prof = "<img src='"+tweets.profile_image_url+"' />"
        var username = "<h4>"+tweets.from_user+"</h5>"
setTimeout(function(){
        $('<div class="tweet">').prependTo($tweets).html(prof+username+text);
        $('.tweet').addClass('animated fadeInLeft');
        },Math.floor(Math.random()*3333));
tweetsFoundSoFar.push(tweets.id)

}




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
    newSearch: function(root, event) {

        clearInterval(curSearch);

        var $tweets = $(root).find('.tweets');
        //$tweets.html('');
        var fragment = $(root).find('input.search').val();
        if (fragment.length == 0) {
            return searchContainer.refresh([]);
        }
        $(root).data('fragment', fragment);
        console.log('updating search term to:'+ fragment)
        searchTerm = fragment;
        curSearch = setInterval(this.updateSearch, 500);


      
    },
    updateSearch: function() {
        console.log('checking fot new:'+ searchTerm)

     bone.io.get('listings').emit('listings:search', searchTerm);



    },
    stopSearch: function() {
        clearInterval(curSearch);        
    }
});

bone.io.route('listings', {
    results: function(listings) {
        return searchContainer.refresh(listings);
    }
});

