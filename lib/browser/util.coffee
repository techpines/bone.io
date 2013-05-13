
bone.async = {}

bone.async.eachSeries = (arr, iterator, callback) ->
    callback = callback or ->

    return callback()  unless arr.length
    completed = 0
    iterate = ->
        iterator arr[completed], (err) ->
            if err
                callback err
                callback = ->
            else
                completed += 1
                if completed >= arr.length
                    callback null
                else
                    iterate()

    iterate()
