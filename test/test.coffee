express = require("express.io")
rack = require("asset-rack")
app = express().http().io()
list = require("./data")
Browser = require 'zombie'
browser = new Browser(silent: true)
should = require('chai').should()

app.use new rack.Rack([new rack.StaticAssets(
  dirname: __dirname
  urlPrefix: "/"
), new rack.BrowserifyAsset(
  filename: "lib/index.coffee"
  url: "/bone.io.js"
)])

# listings controller
app.io.route "listings",
  search: (request) ->
    listMatches = []
    list.forEach (simpsonChar) ->
      regex = new RegExp(request.data.toLowerCase())
      listMatches.push simpsonChar  if (regex).test(simpsonChar.toLowerCase())
    request.io.emit "listings:results", listMatches

app.get "/", (req, res) ->
  res.redirect "/client.html"



app.listen 7076


describe 'View testing', ->
  it 'should work display all of the Simpsons', (done) ->
    browser.visit 'http://localhost:7076/client.html', ->
    #browser.visit 'file:///home/brad/techpines/bone.io/examples/google-search/client.html', ->
        #console.log browser.html()
        browser.window.$('input.search').val 'simp'
        browser.window.$('input.search').keyup()
        setTimeout ->
            browser.window.$('ul.listings').html().should.equal "<li>Bart <strong>Simp</strong>son</li><li>Homer <strong>Simp</strong>son</li><li>Lisa <strong>Simp</strong>son</li><li>Maggie <strong>Simp</strong>son</li><li>Marge <strong>Simp</strong>son</li>"
            done()
        , 200


  it 'should give no result', (done) ->
    browser.visit 'http://localhost:7076/client.html', ->
    #browser.visit 'file:///home/brad/techpines/bone.io/examples/google-search/client.html', ->
        #console.log browser.html()
        browser.window.$('input.search').val 'simpsons are dumb'
        browser.window.$('input.search').keyup()
        setTimeout ->
            browser.window.$('ul.listings').html().should.equal ""
            done()
        , 200


  it 'should return Homer Simpson on clicking search button', (done) ->
    browser.visit 'http://localhost:7076/client.html', ->
    #browser.visit 'file:///home/brad/techpines/bone.io/examples/google-search/client.html', ->
        #console.log browser.html()
        browser.window.$('input.search').val 'homer'
        browser.window.$('.searchBtn').click()
        setTimeout ->
            browser.window.$('ul.listings').html().should.equal "<li><strong>Homer</strong> Simpson</li>"
            done()
        , 400
        
 # afterEach (done) -> process.nextTick ->
 #         app.server.close done