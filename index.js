(function(rabbitMqConnect) {
    "use strict";

    var amqp = require('amqplib');
    var _queueUri = "amqp://localhost";
    var _queueName = "default";

    rabbitMqConnect.configure = function(queueUri, queueName) {
        _queueName = queueName;

        if (queueUri) {
            _queueUri = queueUri;

        }
    };

    function connect(callback) {
        amqp.connect(_queueUri).then(function(conn) {

            process.setMaxListeners(0);
            process.once("SIGINT", function() {
                conn.close();
            });

            return conn.createChannel().then(function(ch) {

                var ok = ch.assertExchange(_queueName, "fanout", {
                    durable: false
                });

                ok.then(function() {
                    callback(ok, ch);
                });
            });
        }).then(null, console.warn);
    }

    function send(message) {
        connect(function(ok, ch) {
            return ok.then(function() {
                ch.publish(_queueName, "", new Buffer(message));
                return ch.close();
            });
        });
    }

    rabbitMqConnect.receive = function(callback) {

        connect(function(ok, ch) {

            ok = ok.then(function() {
                return ch.assertQueue("", {
                    exclusive: true
                });
            });

            ok = ok.then(function(qok) {
                return ch.bindQueue(qok.queue, _queueName, "").then(function() {
                    return qok.queue;
                });
            });

            ok.then(function(queue) {
                return ch.consume(queue, callback, {
                    noAck: true
                });
            });
        });
    };

    rabbitMqConnect.receiveJson = function(callback) {
        return rabbitMqConnect.receive(function(msg) {
            callback(JSON.parse(msg.content.toString()));
        });
    };

    rabbitMqConnect.receiveJsonMessage = function(messageName, callback) {

        return rabbitMqConnect.receive(function(msg) {

            if (!msg || message.msg !== "logging") {
                return;
            }

            callback(JSON.parse(msg.content.toString()));
        });
    };

    rabbitMqConnect.sendJson = function(message) {
        send(JSON.stringify(message));
    };

})(module.exports);
