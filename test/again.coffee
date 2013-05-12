
Browser = require 'zombie'
browser = new Browser(silent: true)

browser.visit 'file:///home/brad/techpines/bone.io/test/dummy.html', ->
    document = browser.document
    script = document.createElement 'script'
    script.type = 'text/javascript'
    script.async = true
    script.onload = ->
        console.log 'we loaded bitches'
    script.src = "file://#{__dirname}/jquery.js"
    document.getElementsByTagName('head')[0].appendChild script
    setTimeout ->
        console.log browser.window.$
    , 5000

