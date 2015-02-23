'use strict';
require('should');
describe('a single message is received', function() {

    var Rabbit = require('../index');

    var rabbit;
    var expectedMessage = 'test message';

    beforeEach(function() {    
        rabbit = new Rabbit(null, new Date().getTime().toString());
    });
    
    it('received message should match the sent one', function(done) {
        rabbit.receiveJson(function(message) {
            message.message.should.be.exactly(expectedMessage);
            rabbit.closeChannel();
            done();
        }, function() {
            rabbit.sendJson({
                message: expectedMessage
            });
        });
    });

    it('received message should match the sent one', function(done) {

        var count = 0;
        var totalMessages = 10;
        rabbit.receiveJson(function() {
            count++;

            if (count > totalMessages) {
                done('too many messages');
            }
        }, function() {

            var i = 0;

            while (i < totalMessages) {
                rabbit.sendJson({
                    message: expectedMessage
                });
                i++;
            }        
        });

        setTimeout(function() {
            if (count === totalMessages) {
            done();

            } else {
                done('wrong number of messages ' + count);
            }
        }, 100);
    });

    it('should only show message types I am interested in', function(done) {
        rabbit.receiveJsonMessage('infoLog', function(message) {
            message.message.should.be.exactly(expectedMessage);
            done();
        }, function() {
            rabbit.sendJson({
                message: expectedMessage,
                messageType: 'infoLog'
            });
        });
    });

    it('should not show message types I am not interested in', function(done) {
        rabbit.receiveJsonMessage('infoLog2', function(message) {
            done('message was called ' + message);
        }, function() {
            rabbit.sendJson({
                message: expectedMessage,
                messageType: 'infoLog'
            });
        });

        setTimeout(function() {
            done();
        }, 60);
    });
});
