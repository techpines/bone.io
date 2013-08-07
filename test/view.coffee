
# view.coffee - view test code

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

    it 'should open modal when target id is specified in modal', (done) ->
        contents = fs.readFileSync(pathutil.join(__dirname, 'modalHasIdTest.html'), 'utf8')
        $('body').html contents
        Modal = bone.view '.modal',
            open: ->
                id = @$el.attr('id')
                if id is 'second'
                    done()
                else
                    throw new Error('Wrong modal opened.')
        ModalController = bone.view '.modal-controller',
            events:
                'click': 'openModal'
            openModal: ->
                id = @$el.attr('data-target')
                Modal.$(id).open()
        $('.modal-controller').click()

    it 'should no-op when target id is missing in modal', (done) ->
        contents = fs.readFileSync(pathutil.join(__dirname, 'modalMissingIdTest.html'), 'utf8')
        $('body').html contents
        Modal = bone.view '.modal',
            open: ->
                throw new Error('Modal should not have opened.')
        ModalController = bone.view '.modal-controller',
            events:
                'click': 'openModal'
            openModal: ->
                id = @$el.attr('data-target')
                Modal.$(id).open()
                setTimeout(done, 200)
        $('.modal-controller').click()


    it 'should work when two views are created for same element', (done) ->
        contents = fs.readFileSync(pathutil.join(__dirname, 'genericButton.html'), 'utf8')
        $('body').html contents
        myButtonClicked = false
        MyButtonClass = bone.view '.myButton',
            testNumber: 1,
            buttonClassClicked: ->
                @testNumber.should.equal 1
                myButtonClicked = true
        MyButtonId = bone.view '#buttonId',
            testNumber: 2,
            buttonIdClicked: ->
                @testNumber.should.equal 2
                if myButtonClicked is true
                    done()

        MyButtonClass.buttonClassClicked()
        MyButtonId.buttonIdClicked()

    it 'should work with scoping', (done) ->
        contents = fs.readFileSync(pathutil.join(__dirname, 'view-scoping.html'), 'utf8')
        $('body').html contents
        DataRow = bone.view 'tr',
            addClass: (classToAdd) ->
                @$el.addClass classToAdd
        
        DataRow.$(':nth-child(even)').addClass 'even'
        $('tr:nth-child(even)').each (index, element) ->
            $(element).hasClass('even').should.equal true
        $('tr:nth-child(odd)').each (index, element) ->
            $(element).hasClass('even').should.equal false

        done()

