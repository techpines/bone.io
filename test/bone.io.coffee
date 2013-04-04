should = require('chai').should()
express = require('express.io')
rack = require('asset-rack')
global.window = {}
global.$ = {}
require('../bone.io')



describe 'a bone view', ->
    app = null 
 
    it "I have no idea what im doing", (done) ->
        searchContainer = window.bone.view(".search-container",
          events:
            "keyup input.search": "search"

          refresh: (root, listings) ->
            self = this
            done()
            
        )


        
    afterEach (done) -> process.nextTick ->
        app.server.close done
