'use strict';
require('should');
describe('a single message is received', function() {

    var Rabbit = require('../index');

    var rabbit;
    var expectedMessage = 'test message';

    beforeEach(function() {
        rabbit = new Rabbit(null, 'PickTheLadder');
    });

    afterEach(function() {
        rabbit.closeChannel();
    });

    it('received message should match the sent one', function(done) {
        rabbit.receiveJson(function(message) {
            message.message.should.be.exactly(expectedMessage);
            done();
        }, function() {
            rabbit.sendJson({
                message: expectedMessage
            });
        });
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
        }, 100);
    });
});
