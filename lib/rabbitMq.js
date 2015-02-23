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

    addRabbitListener("connectToRabbitServer", function(queueInfo) {

        amqp.connect(_queueUri, function(err, conn) {
            if (err !== null) bail(err);

            process.setMaxListeners(0);
            process.once("SIGINT", function() {
                console.log("Connection Failed");
                conn.close();
            });

            rabbit.emit("JoinChannel", conn, queueInfo);
        });
    });

    addRabbitListener("JoinChannel", function(conn, queueInfo) {
        conn.createChannel(function(err, ch) {
            if (err !== null) bail(err);

            rabbit.emit("JoinedChannel", ch, conn, queueInfo);
        });
    });

    addRabbitListener("JoinedChannel", function(ch, conn, queueInfo) {

        ch.assertExchange(_queueName, "fanout", {
                durable: false
            },
            function() {
                rabbit.emit("Connected" + queueInfo.returnEvent, ch, conn, queueInfo);
            });
    });

    addRabbitListener("ConnectedRec", function(ch, conn, queueInfo) {
        var qok = ch.assertQueue("", {
            exclusive: true
        });
        var queue = qok.queue;
        ch.bindQueue(queue, RabbitMq.prototype.queueName(), "");
        ch.consume(queue, queueInfo.callback, {
            noAck: true
        }, function(err, ok) {
            if (err !== null) return bail(err);

            _currentChannel = ch;
            if (queueInfo.done) {
                queueInfo.done();
            }
        });
    });

    addRabbitListener("ConnectedSend", function(ch, conn, queueInfo) {
        ch.publish(_queueName, "", new Buffer(queueInfo.message));
        ch.close(function() {
            conn.close();
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
    rabbit.emit("connectToRabbitServer", {
        returnEvent: "Send",
        message: message
    });
};

function addRabbitListener(name, listener) {
    var listeners = rabbit.listeners(name);

    if (!listeners || listeners.length === 0) {
        rabbit.on(name, listener);
    }
}

RabbitMq.prototype.receive = function(callback, done) {
    rabbit.emit("connectToRabbitServer", {
        returnEvent: "Rec",
        callback: callback,
        done: done
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
