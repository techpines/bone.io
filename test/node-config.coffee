bone = require('../.')
should = require('chai').should()
_ = require('underscore')

describe 'node config', ->

   it 'should add key/value pair to config object', (done) ->
        bone.set('testNumber', 8)
        if _.isEqual(bone.config, {'testNumber': 8})
            done()
        else
            throw new Error('bone.set function did not set key/value pair')

   it 'should get value from config object when passing a key', (done) ->
        bone.config.testNumber = 10
        if bone.get('testNumber') is 10
            done()
        else
            throw new Error('bone.get function did not retrieve value based on key')
