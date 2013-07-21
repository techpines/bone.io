
should = require('chai').should()
pathutil = require 'path'
async = require 'async'
Browser = require 'zombie'
browser = new Browser(silent: true)
require('./util') browser

bone = undefined
$ = undefined

describe 'router', ->
    before (done) ->
        dummyFile = pathutil.resolve "#{__dirname}/dummy.html"
        jqueryFile = pathutil.resolve "#{__dirname}/jquery.js"
        boneFile = pathutil.resolve "#{__dirname}/../bone.io.js"

        browser.visit "file://#{dummyFile}", ->
            async.each [
                "file://#{jqueryFile}"
                "file://#{boneFile}"
            ], browser.injectScript, ->
                bone = browser.window.bone
                $ = browser.window.$
                done()

    it 'should work', (done) ->
        bone.router
            routes:
                '': 'home'
                'test': 'test'
            home: ->
                bone.history.getFragment().should.equal ''
                bone.router.navigate 'test', trigger: true
            test: ->
                bone.history.getFragment().should.equal 'test'
                done()

        bone.router.start()
