
app = require('../../examples/textsearch/app')
Browser = require 'zombie'
browser = new Browser(silent: true)
should = require('chai').should()

describe 'View testing', ->
  it 'should work display all of the Simpsons', (done) ->
    browser.visit 'http://localhost:7076/search.html?path=./client.html', (error) ->
        throw error if error?
        browser.window.$('input.search').val 'simp'
        browser.window.$('input.search').keyup()
        setTimeout ->
            browser.window.$('ul.listings').html().should.equal "<li>Bart <strong>Simp</strong>son</li><li>Homer <strong>Simp</strong>son</li><li>Lisa <strong>Simp</strong>son</li><li>Maggie <strong>Simp</strong>son</li><li>Marge <strong>Simp</strong>son</li>"
            done()
        , 200

  it 'should give no result', (done) ->
    browser.visit 'http://localhost:7076/client.html', ->
        browser.window.$('input.search').val 'simpsons are dumb'
        browser.window.$('input.search').keyup()
        setTimeout ->
            browser.window.$('ul.listings').html().should.equal ""
            done()
        , 200


  it 'should return Homer Simpson on clicking search button', (done) ->
    browser.visit 'http://localhost:7076/client.html', ->
        browser.window.$('input.search').val 'homer'
        browser.window.$('.searchBtn').click()
        setTimeout ->
            browser.window.$('ul.listings').html().should.equal "<li><strong>Homer</strong> Simpson</li>"
            done()
        , 400
        
after (done) -> process.nextTick ->
    browser.close()
    app.server.close ->
        done()
