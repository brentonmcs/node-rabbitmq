"use strict";

var _queueUri = "amqp://localhost";
var _queueName = "default";
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var rabbit;

var _currentChannel;

function RabbitMq(queueUri, queueName, amqp) {
    _queueName = queueName;

    if (queueUri) {
        _queueUri = queueUri;
    }

    EventEmitter.call(this);
    rabbit = this;

    addRabbitListener("connectToRabbitServer", function(returnEvent) {

        amqp.connect(_queueUri, function(err, conn) {
            if (err !== null) bail(err);

            process.setMaxListeners(0);
            process.once("SIGINT", function() {
                console.log("Connection Failed");
                conn.close();
            });

            rabbit.emit("JoinChannel", conn, returnEvent);
        });
    });

    addRabbitListener("JoinChannel", function(conn, returnEvent) {
        conn.createChannel(function(err, ch) {
            if (err !== null) bail(err);

            rabbit.emit("JoinedChannel", ch, conn, returnEvent);
        });
    });

    addRabbitListener("JoinedChannel", function(ch, conn, returnEvent) {

        ch.assertExchange(_queueName, "fanout", {
                durable: false
            },
            function() {
                rabbit.emit("Connected" + returnEvent, ch, conn);
            });
    });
}

util.inherits(RabbitMq, EventEmitter);

RabbitMq.prototype.queueName = function() {
    return _queueName;
};

RabbitMq.prototype.queueUri = function() {
    return _queueUri;
};

function bail(err) {
    console.error(err);
    process.exit(1);
}

RabbitMq.prototype.sendMessage = function(message) {

    rabbit.emit("connectToRabbitServer", "Send");

    addRabbitListener("ConnectedSend", function(ch, conn) {
        ch.publish(_queueName, "", new Buffer(message));
        ch.close(function() {
            conn.close();
        });
    });
};

function addRabbitListener(name, listener) {
    var listeners = rabbit.listeners(name);

    if (!listeners || listeners.length === 0) {
        rabbit.on(name, listener);
    }
}

RabbitMq.prototype.receive = function(callback, done) {

    rabbit.emit("connectToRabbitServer", "Rec");

    addRabbitListener("ConnectedRec", function(ch) {
        var qok = ch.assertQueue("", {
            exclusive: true
        });
        rabbit.emit("Consume", qok, ch);
    });

    addRabbitListener("Consume", function(qok, ch) {
        console.log("consuming");

        var queue = qok.queue;
        ch.bindQueue(queue, RabbitMq.prototype.queueName(), "");
        return ch.consume(queue, callback, {
            noAck: true
        }, function(err, ok) {
            if (err !== null) return bail(err);

            _currentChannel = ch;
            if (done) {
                done();
            }
        });
    });
};

RabbitMq.prototype.receiveJson = function(callback, done) {
    return RabbitMq.prototype.receive(function(msg) {
        callback(JSON.parse(msg.content.toString()));
    }, done);
};

RabbitMq.prototype.receiveJsonMessage = function(messageName, callback, done) {

    return RabbitMq.prototype.receiveJson(function(msg) {

        if (!msg || msg.messageType !== messageName) {
            return;
        }

        callback(msg);
    }, done);
};

RabbitMq.prototype.sendJson = function(message) {
    RabbitMq.prototype.sendMessage(JSON.stringify(message));
};

RabbitMq.prototype.closeChannel = function() {
    if (_currentChannel) {
        _currentChannel.close();
    }
};

module.exports = RabbitMq;
