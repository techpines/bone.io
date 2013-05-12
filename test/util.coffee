
module.exports = (browser) ->

    # Adds a script dynamically
    browser.injectScript = (src, next) ->
        document = browser.document
        script = document.createElement 'script'
        script.type = 'text/javascript'
        script.async = true
        script.src = src
        script.onload = ->
            next()
        document.getElementsByTagName('head')[0].appendChild script
