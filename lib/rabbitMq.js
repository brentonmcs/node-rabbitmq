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
            queueInfo.conn = conn;
            rabbit.emit("JoinChannel", queueInfo);
        });
    });

    addRabbitListener("JoinChannel", function(queueInfo) {
        queueInfo.conn.createChannel(function(err, ch) {
            if (err !== null) bail(err);

            queueInfo.ch = ch;
            rabbit.emit("JoinedChannel", queueInfo);
        });
    });

    addRabbitListener("JoinedChannel", function(queueInfo) {
        queueInfo.ch.assertExchange(_queueName, queueInfo.queueOptions.queueMode, {
                durable: true,
                autoDelete: true
            },
            function() {
                rabbit.emit("Connected" + queueInfo.returnEvent, queueInfo);
            });
    });

    addRabbitListener("ConnectedRec", function(queueInfo) {
        var qok = queueInfo.ch.assertQueue("", {
            exclusive: true
        }, function(err) {
            if (err !== null) return bail(err);
            queueInfo.queue = qok.queue;

            queueInfo.ch.bindQueue(queueInfo.queue, _queueName, queueInfo.queueOptions.messageRoute, {}, function() {
                rabbit.emit("ConsumeQueue", queueInfo);
            });
        });
    });

    addRabbitListener("ConsumeQueue", function(queueInfo) {
        queueInfo.ch.consume(queueInfo.queue, queueInfo.callback, {
            noAck: false
        }, function(err, ok) {
            if (err !== null) return bail(err);

            _currentChannel = queueInfo.ch;
            if (queueInfo.done) {
                queueInfo.done();
            }
        });
    });

    addRabbitListener("ConnectedSend", function(queueInfo) {
        queueInfo.ch.publish(_queueName, queueInfo.queueOptions.messageRoute, new Buffer(queueInfo.message));
        queueInfo.ch.close(function() {
            queueInfo.conn.close();
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

RabbitMq.prototype.sendMessage = function(message, messageRoute) {
    rabbit.emit("connectToRabbitServer", {
        returnEvent: "Send",
        message: message,
        queueOptions: getQueueOptions(messageRoute)
    });
};

function addRabbitListener(name, listener) {
    var listeners = rabbit.listeners(name);

    if (!listeners || listeners.length === 0) {
        rabbit.on(name, listener);
    }
}

function getQueueOptions(messageRoute) {
    var retVal = {
        queueMode: "fanout",
        messageRoute: messageRoute
    };

    if (messageRoute && messageRoute.length > 0) {
        retVal.queueMode = "direct";
    } else {
        retVal.messageRoute = "";
    }

    return retVal;
}


RabbitMq.prototype.receive = function(callback, done, messageRoute) {

    rabbit.emit("connectToRabbitServer", {
        returnEvent: "Rec",
        callback: callback,
        done: done,
        queueOptions: getQueueOptions(messageRoute)

    });
};

RabbitMq.prototype.receiveJson = function(callback, done) {
    return RabbitMq.prototype.receive(function(msg) {
        callback(JSON.parse(msg.content.toString()));
    }, done);
};

RabbitMq.prototype.receiveDirectMessage = function(messageRoute, callback, done) {
    return RabbitMq.prototype.receive(function(msg) {
        callback(JSON.parse(msg.content.toString()));
    }, done, messageRoute);
};

RabbitMq.prototype.receiveJsonMessage = function(messageType, callback, done) {

    return RabbitMq.prototype.receiveJson(function(msg) {

        if (!msg || msg.messageType !== messageType) {
            return;
        }

        callback(msg);
    }, done);
};

RabbitMq.prototype.sendJson = function(message, messageRoute) {
    RabbitMq.prototype.sendMessage(JSON.stringify(message), messageRoute);
};

RabbitMq.prototype.closeChannel = function() {
    if (_currentChannel) {
        _currentChannel.close();
    }
};

module.exports = RabbitMq;
