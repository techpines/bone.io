
express = require('express.io')
rack = require('asset-rack')

app = express().http().io()
project = 'table'

app.set 'view engine', 'jade'
app.set 'views', __dirname

app.use new rack.Rack [
    new rack.BrowserifyAsset
        filename: "./#{project}/client.coffee"
        url: '/app.js'
    new rack.LessAsset
        filename: "./index.less"
        url: '/style.css'
]

app.get '/', (request, response) ->
    response.render "#{project}/index.jade"

app.listen 7076
