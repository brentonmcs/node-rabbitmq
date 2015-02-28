'use strict';
require('should');

describe('sending and receiving messages (direct mode)', function() {

    var Rabbit = require('../');

    var rabbit;
    var expectedMessage = 'test message';

    beforeEach(function() {
        rabbit = new Rabbit(null, new Date().getTime().toString());
    });

    it('received message should match the sent one', function(done) {
        rabbit.receiveDirectMessage('special', function(message) {
            message.message.should.be.exactly(expectedMessage);
            rabbit.closeChannel();
            done();
        }, function() {
            rabbit.sendJson({
                message: expectedMessage
            }, 'special');
        });
    });


    it('should not receive messages not directed to it', function(done) {
        rabbit.receiveDirectMessage('special2', function() {
            done('received directed message it should not have');
        }, function() {

            rabbit.sendJson({
                message: expectedMessage
            }, 'special');

            setTimeout(function() {
                done();
            }, 70);
        });


    });
});
