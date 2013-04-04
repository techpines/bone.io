
Browser = require 'zombie'
browser = new Browser(silent: true)

browser.visit 'http://localhost:7076/client.html', ->
#browser.visit 'file:///home/brad/techpines/bone.io/examples/google-search/client.html', ->
    console.log browser.html()
    browser.window.$('input.search').val 'simp'
    browser.window.$('input.search').keyup()
    setTimeout ->
        console.log browser.window.$('ul.listings').html()
    , 500
