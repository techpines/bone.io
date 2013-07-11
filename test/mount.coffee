
should = require('chai').should()
pathutil = require 'path'
async = require 'async'
Browser = require 'zombie'
browser = new Browser(silent: true)
require('./util') browser

bone = undefined
$ = undefined

describe 'mounts', ->
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
                browser.window.templates =
                    test: -> '<div id="template-start"></div>'
                    testWithData: (data) ->
                        '<div>' + data + '</div>'
                $('body').append '<div id="generic-outlet"></div>'
                done()

    it 'should work', ->
        bone.set('templates', browser.window.templates)
        bone.mount '#generic-outlet', 'test'
        $('#template-start').length.should.equal 1

    it 'should work without refresh', ->
        bone.mount '#generic-outlet', 'test'
        $('#template-start').append('<div class="cheese">cheese</div>')
        bone.mount '#generic-outlet', 'test'
        $('.cheese').length.should.equal 1

    it 'should work with refresh', ->
        bone.mount '#generic-outlet', 'test'
        $('#template-start').append('<div class="cheese">cheese</div>')
        bone.mount '#generic-outlet', 'test', {refresh: true}
        $('.cheese').length.should.equal 0
