'use strict';

(function () {

    var context;

    function RabbitMq(queueUri, callback, errorCallback) {
        context = require('rabbit.js').createContext(queueUri);

        context.on('ready', function () {

            if (callback) {
                callback();
            }
        });

        context.on('error', function (err) {

            if (errorCallback) {
                errorCallback(err);
            } else {
                console.log('RabbitMq Error');
                console.log(err);
            }
        });
    }

    RabbitMq.prototype.sendJson = function (message, routeName) {
        var pushSocket = context.socket('PUSH');

        pushSocket.connect(routeName, function () {

            pushSocket.write(JSON.stringify(message));
        });
    };

    RabbitMq.prototype.receiveJson = function (routeName, callback) {
        var workerSocket = context.socket('WORKER');
        workerSocket.connect(routeName);
        workerSocket.on('data', function (message) {
            var json = JSON.parse(message);
            callback(json, this);
        });

    };

    module.exports = RabbitMq;
}());
