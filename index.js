"use strict";

var Rabbit = require("./lib/rabbit");
var rabbit = null;

function RabbitMqConnect(queueUri, callback) {
    rabbit = new Rabbit(queueUri, callback);
}


RabbitMqConnect.prototype.receiveJson = function(routeName, callback) {
    rabbit.receiveJson(callback, done);
};


RabbitMqConnect.prototype.sendJson = function(message, routeName) {
    rabbit.sendJson(message, routeName  );
};

module.exports = RabbitMqConnect;
