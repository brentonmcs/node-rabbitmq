"use strict";

var amqp = require("amqplib/callback_api");
var Rabbit = require("./lib/rabbitMq");
var rabbit = null;

function RabbitMqConnect(queueUri, queueName) {
    rabbit = new Rabbit(queueUri, queueName, amqp);
}

RabbitMqConnect.prototype.receive = function(callback, done) {
    rabbit.receive(callback, done);
};

RabbitMqConnect.prototype.receiveJson = function(callback, done) {
    rabbit.receiveJson(callback, done);
};

RabbitMqConnect.prototype.receiveJsonMessage = function(messageName, callback, done) {
    rabbit.receiveJsonMessage(messageName, callback, done);
};

RabbitMqConnect.prototype.sendMessage = function(message) {
    rabbit.sendMessage(message);
};

RabbitMqConnect.prototype.sendJson = function(message) {
    rabbit.sendJson(message);
};

RabbitMqConnect.prototype.closeChannel = function() {
    rabbit.closeChannel();
};
module.exports = RabbitMqConnect;
