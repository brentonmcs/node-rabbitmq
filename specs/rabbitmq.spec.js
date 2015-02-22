'use strict';

var Rabbit = require('../lib/rabbitMq');
var sinon = require('sinon');

require('should');

var defaultUri = 'amqp://localhost';

describe('Configure should set values', function() {

    it('should set Queue Name', function() {

        var expected = 'test';
        var rabbit = new Rabbit(null, expected);
        rabbit.queueName().should.be.exactly(expected);
    });

    it('should not set Queue Uri if null', function() {
        var rabbit = new Rabbit(null, 'test');
        rabbit.queueUri().should.be.exactly(defaultUri);
    });

    it('should set Queue Uri if not null', function() {
        var expected = 'notlocal:8000';
        var rabbit = new Rabbit(expected, 'test');
        rabbit.queueUri().should.be.exactly(expected);
    });
});

describe('Sending messages on the queue', function() {

    var amqp = {
            connect: function() {}
        },
        conn = {
            createChannel: function() {}
        },
        channel = {
            assertExchange: function() {},
            publish: function() {},
            close: function() {}
        },
        mock = null,
        connMock = null,
        chMock = null,
        rabbit = null;

    beforeEach(function() {
        mock = sinon.mock(amqp);
        connMock = sinon.mock(conn);
        chMock = sinon.mock(channel);

        rabbit = new Rabbit(defaultUri, 'test', amqp);
    });

    afterEach(function () {
        mock.restore();
    });

    it('should call connect', function() {
        mock.expects('connect').once();
        rabbit.sendMessage('test');
        mock.verify();        
    });

    it('should use the correct queue name', function() {
        mock.expects('connect').once().withArgs(defaultUri);
        rabbit.sendMessage('test');
        mock.verify();
    });

    it('should call Create Channel', function() {
        connMock.expects('createChannel').once();
        rabbit.emit('JoinChannel', conn, 'Send');
        connMock.verify();
    });

    it('should call Assert Exchange', function() {
        chMock.expects('assertExchange').once().withArgs('test', 'fanout', {
            durable: false
        });
        rabbit.emit('JoinedChannel', channel, 'Send');

        chMock.verify();
    });

    it('should call connected and publish', function() {
        chMock.expects('publish').withArgs('test');
        rabbit.sendMessage('test');

        rabbit.emit('ConnectedSend', channel);
        chMock.verify();
    });

    it('should call connected and close connection', function() {
        chMock.expects('close').once();
        rabbit.sendMessage('test');
        
        rabbit.emit('ConnectedSend', channel);
        chMock.verify();
    });

});
