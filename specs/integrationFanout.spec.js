'use strict';
require('should');
describe('sending and receiving messages (fanout mode)', function() {

    var Rabbit = require('../');

    var rabbit;
    var expectedMessage = 'test message';

    beforeEach(function() {
        rabbit = new Rabbit(null, new Date().getTime().toString(),false);
    });

    it('sendt message should be received', function(done) {
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
        var totalMessages = 200;
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

                setTimeout(function () {

                }, 10);
            }
        });

        setTimeout(function() {
            if (count === totalMessages) {
                done();

            } else {
                done('wrong number of messages ' + count);
            }
        }, 1000);
    });

    it('received two messages should match the sent ones', function(done) {

        var count = 0,
            oneCount = 0,
            twoCount = 0;
        var totalMessages = 10;
        rabbit.receiveJson(function(message) {

            count++;

            if (message.message === expectedMessage + '1') {
                oneCount++;
            }
            if (message.message === expectedMessage + '2') {
                twoCount++;
            }

            if (count > totalMessages  * 2) {
                done('too many messages');
            }
        }, function() {

            var i = 0;

            while (i < totalMessages) {
                rabbit.sendJson({
                    message: expectedMessage + '1'
                });

                rabbit.sendJson({
                    message: expectedMessage + '2'
                });
                i++;
            }
        });

        setTimeout(function() {
            if (count === (totalMessages  * 2) && oneCount === totalMessages && twoCount === totalMessages) {
                done();

            } else {
                done('wrong number of messages ' + count + 'one count:' + oneCount + ' twoCount' + twoCount);
            }
        }, 120);
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
