should = require('chai').should()
fs = require 'fs'
pathutil = require 'path'
async = require 'async'
Browser = require 'zombie'
browser = new Browser(silent: true)
require('./util') browser
_ = require('underscore')

bone = undefined
$ = undefined

describe 'browser config', ->
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

    it 'should add key/value pair to config object', (done) ->
        bone.set('testNumber', 8)
        if _.isEqual(bone.config, {'testNumber': 8})
            done()
        else
            throw new Error('bone.set function did not set key/value pair')

    it 'should get value from config object when passing a key', (done) ->
        bone.config.testNumber = 10
        if bone.get('testNumber') is 10
            done()
        else
            throw new Error('bone.get function did not retrieve value based on key')
