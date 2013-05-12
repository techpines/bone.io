
bone.async = {}

_each = (arr, iterator) ->
    return arr.forEach(iterator)  if arr.forEach
    i = 0

    while i < arr.length
        iterator arr[i], i, arr
        i += 1

only_once = (fn) ->
    called = false
    ->
        throw new Error("Callback was already called.")  if called
        called = true
        fn.apply root, arguments_

bone.async.each = (arr, iterator, callback) ->
    callback = callback or ->
    return callback()  unless arr.length
    completed = 0
    _each arr, (x) ->
        iterator x, only_once (err) ->
            if err
                callback err
                callback = ->
            else
                completed += 1
                callback null  if completed >= arr.length
