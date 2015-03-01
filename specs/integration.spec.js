'use strict';

var RabbitJs = require('../lib/rabbit');
var rabbit;
require('should');

describe('sends and receives messages', function () {

    beforeEach(function (done) {
        rabbit = new RabbitJs("amqp://localhost", done);
    });

    it('should receive messages', function (done) {

        var testMsg = 'adawdwa';
        rabbit.receiveJson('testQueue', function (message, that) {
            JSON.parse(message).message.should.be.exactly(testMsg);
            that.ack();
            done();
        });

        rabbit.sendJson({message: testMsg}, 'testQueue');
    });


    it('should receive messages even if they are sent first', function (done) {

        var testMsg = 'adawdwa';

        rabbit.sendJson({message: testMsg}, 'testQueue2');

        rabbit.receiveJson('testQueue2', function (message, that) {
            var json = JSON.parse(message);
            json.message.should.be.exactly(testMsg);
            that.ack();
            done();
        });


    });

    it('send multiple messages', function (done) {

        var testMsg = 'adawdwa';

        var routeName = 'testQueue3';

        rabbit.sendJson({message: testMsg}, routeName);
        rabbit.sendJson({message: testMsg}, routeName);
        rabbit.sendJson({message: testMsg}, routeName);
        rabbit.sendJson({message: testMsg}, routeName);
        rabbit.sendJson({message: testMsg}, routeName);

        var i = 0;
        rabbit.receiveJson(routeName, function (message, that) {
            that.ack();
            i++;

            if (i === 5) {
                done();
            }
        });


    });

    it('send multiple messages to different queues', function (done) {

        var a = 0, b = 0;
        var totalMessage = 10;

        var recMessage = function (worker, inc) {
            worker.ack();
            inc();
            if ((a + b) === totalMessage) {
                done()
            }
        };
        var testMsg = 'adawdwa';
        var q = 'testQueue4';

        var sendMessage = function () {
            var j = 0;
            while (j < totalMessage) {
                rabbit.sendJson({message: testMsg}, q);

                setTimeout(function () {

                }, 10);
                j++;
            }
        };

        rabbit.receiveJson(q, function (message, that) {
                recMessage(that, function () {
                    b++;
                })
            }
        );

        var rabbit2 = new RabbitJs("amqp://localhost", function () {


            rabbit2.receiveJson(q, function (message, that) {
                recMessage(that, function () {
                    a++;
                });
            });


            sendMessage();

        });

        var rabbit3 = new RabbitJs("amqp://localhost", function () {


            rabbit3.receiveJson(q, function (message, that) {
                recMessage(that, function () {
                    a++;
                });
            });


            sendMessage();

        });

    });
});
