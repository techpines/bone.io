
facts = bone.get('facts')
    
$list = bone.view 'ul.facts',
    refresh: ->
        @$el.html ''
        @$el.append('<li>').html fact

bone.interface 'input.search',
    keypress: ->
        fragment = @$el.val()
        facts.io.emit 'search', fragment
        
facts.io.route 'facts',
    results: (facts, meta) ->
        $list.refresh facts


bone.start()
