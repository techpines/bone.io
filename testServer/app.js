// Setup express, socket.io, and http server
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, {log: false});
var should = require('chai').should();
var Browser = require('zombie');
var browser = new Browser();
var bone = require('../.');

describe('sockets', function() {
    before(function(done) {
		// Configure bone.io default IO options
		bone.set('io.options', {
		    server: io
		});

		// Serves bone.io browser scripts
		app.use(bone.static());
		    
		app.get('/', function(req, res){
		  res.sendfile('./client.html');
		});

		// Listen up
		server.listen(7076, function() {
	        browser.visit('http://localhost:7076/', function(error) {
	            browser.window.$(function() {
	                done();
	            });
		    });
	    });
    });

   it('should send message to server', function(done) {
        var Server = bone.io('test', {
            inbound: {
                messageServer: function(data, context) {
                    var self = this;
                    console.log('message server done');
                    done();
                }
            }
        });

        var Client2 = browser.window.bone.io('test', {
            outbound: {
                shortcuts: ['messageServer']
            },
        });

        Client2.messageServer('hello');
    });

    it('should send message to client', function(done) {
        var Server2 = bone.io('test2', {
        	outbound:{shortcuts: ['shout']}
        });
        var Browser = browser.window.bone.io('test2', {
        	inbound: {
        		shout: function(data, context) {
                    console.log('test2 done')
        			done();
        		}
        	}
        });
        Server2.shout('hello');
    });

    it.skip('should ###########', function(done) {
        var Server3 = bone.io('test3', {
            outbound: {
                shortcuts: ['message']
            },
            inbound: {
                register: function(data, context) {
                    console.log('in register');
                    this.join('chat');
                                var that = this;
                process.nextTick(function() {
                    that('chat').message('hey there');
                    that('no-chat').message('should not receive');
                });
                }
            }

        });
        var Client3 = browser.window.bone.io('test3', {
            outbound: {
                shortcuts: ['register']
            }, 
            inbound: {
                message: function(data, context) {
                                        console.log('heyyyyyy');
                    done();
                }
            }

        });
        Client3.register('sfss');
    });
    
});
