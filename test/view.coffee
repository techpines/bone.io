
should = require('chai').should()
fs = require 'fs'
pathutil = require 'path'
async = require 'async'
Browser = require 'zombie'
browser = new Browser(silent: true)
require('./util') browser

bone = undefined
$ = undefined

describe 'view', ->
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
        $('body').append '<input>'
        View = bone.view 'input',
            events:
                'click': 'action'
            action: ->
                done()
        $('input').click()

    it 'should ', (done) ->
        contents = fs.readFileSync(pathutil.join(__dirname, 'modal-test.html'), 'utf8')
        $('body').html contents
        Modal = bone.view '.modal',
            open: ->
                id = @$el.attr('id')
                if id is 'first'
                    done()
                else
                    throw new Error('Wrong modal opened.')
        ModalController = bone.view '.modal-controller',
            events:
                'click': 'openModal'
            openModal: ->
                console.log('we clicked')
                id = @$el.attr('data-target')
                Modal(id).open()
        $('.modal-controller').click()




