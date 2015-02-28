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

RabbitMqConnect.prototype.receiveDirectMessage = function(messageRoute, callback, done) {
	rabbit.receiveDirectMessage(messageRoute, callback, done);
};

RabbitMqConnect.prototype.sendMessage = function(message, messageRoute) {
    rabbit.sendMessage(message, messageRoute);
};

RabbitMqConnect.prototype.sendJson = function(message, messageRoute) {
    rabbit.sendJson(message, messageRoute);
};

RabbitMqConnect.prototype.closeChannel = function() {
    rabbit.closeChannel();
};
module.exports = RabbitMqConnect;
