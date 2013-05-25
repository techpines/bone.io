
# Middleware.coffee - IO middleware

connect = require 'connect'

bone = io: {}

bone.io.middleware = module.exports = {}

# Session middlware for express/connect integration
bone.io.middleware.session = (options) ->
    secret = options.secret
    cookieSecret = options.cookie.secret
    cookieParser = connect.cookieParser cookieSecret

    # Middleware session function
    (data, context, next) ->
        socket = context.socket
        cookieParser context, null, (error) ->
            return @error error if error?
            raw = context.cookies['connect.sid']
            context.sessionID = connect.utils.parseSignedCookie raw, secret
            context.sessionStore = options.store
            options.store.get context.sessionID, (error, session) ->
                return @error error if error?
                context.session = new connect.session.Session context, session
                next()
