should = require('chai').should()
express = require('express.io')
rack = require('asset-rack')
global.window = global
global.$ = ->
    fakeJquery = []
    return fakeJquery
require('../lib/index')

describe 'a bone view', ->
    it "I have no idea what im doing", (done) ->

    searchContainer = bone.view("window",
      events:
        "keyup window": "search"

      search: (root, event) ->
        x = 5
        done()
    )

    searchContainer.search()


   
