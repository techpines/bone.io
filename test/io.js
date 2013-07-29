// Setup express, socket.io, and http server
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, {log: false});
var _ = require('underscore');
var should = require('chai').should();
var Browser = require('zombie');
var browser = new Browser({silent: true});
var bone = require('../.');

describe('io', function() {
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
                routes: ['message']
            },
            inbound: {
                register: function(data, context) {
                    var properties = [
                        'route', 'data', 'namespace',
                        'socket', 'headers', 'handshake'
                    ]
                    _.each(properties, function(property) {
                        context.should.have.property(property);
                    });

            
                    this.join(data);
                    this.room(data).message('this message should be received');
                    this.room('no-chat').message('this message should not be received');
                }
            }

        });
        var Client = browser.window.bone.io('test1', {
            outbound: {
                routes: ['register']
            }, 
            inbound: {
                message: function(data, context) {
                    properties = [
                        'route', 'data', 'namespace', 'socket',
                    ]
                    _.each(properties, function(property) {
                        var type = typeof context[property]
                        type.should.not.equal('undefined');
                    });
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
        	outbound:{routes: ['shout']}
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
