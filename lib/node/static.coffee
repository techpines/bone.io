
fs = require 'fs'
pathutil = require 'path'

bone = {}

# Scripts that will be accessible from /bone.io/[scriptName]
boneScripts = {
    "bone.io.js": fs.readFileSync("#{__dirname}/../../bone.io.js", 'utf8')
}

bone.static = module.exports = (options) ->
    (request, response, next) ->
        for scriptName, contents of boneScripts
            if request.url is "/bone.io/#{scriptName}"
                response.set 'Content-Type', 'text/javascript'
                return response.send contents
        next()

bone.static.add = (path) ->
    boneScripts[pathutil.basename(path)] = fs.readFileSync(path, 'utf8')
