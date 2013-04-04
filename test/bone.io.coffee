should = require('chai').should()
express = require('express.io')
rack = require('asset-rack')
global.window = global
global.$ = ->
require('../bone.io')

describe 'a bone view', ->
    it "I have no idea what im doing", (done) ->
        done()
