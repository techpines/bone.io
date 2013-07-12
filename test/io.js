// Setup express, socket.io, and http server
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, {log: true});
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
		  res.sendfile(__dirname + '/client.html');
		});

		// Listen up
		server.listen(7076, function() {
	        browser.visit('http://localhost:7076/', function(error) {
                done();                
		    });
	    });
    });

    it('should send message to client when client registers for room and message is sent to room', function(done) {
        var Server = bone.io('test1', {
            outbound: {
                shortcuts: ['message']
            },
            inbound: {
                register: function(data, context) {
                    console.log('in register');
                    this.join(data);
                    this(data).message('this message should be received');
                    this('no-chat').message('this message should not be received');
                }
            }

        });
        var Client = browser.window.bone.io('test1', {
            outbound: {
                shortcuts: ['register']
            }, 
            inbound: {
                message: function(data, context) {
                    data.should.equal('this message should be received');
                    done();
                }
            }

        });
        Client.register('chat');
    });

    it('should send message to client', function(done) {
        var testMessage = 'hello';
        var Server = bone.io('test2', {
        	outbound:{shortcuts: ['shout']}
        });
        var Client = browser.window.bone.io('test2', {
        	inbound: {
        		shout: function(data, context) {
                    data.should.equal(testMessage);
        			done();
        		}
        	}
        });
        Server.shout(testMessage);
    });
    
});
