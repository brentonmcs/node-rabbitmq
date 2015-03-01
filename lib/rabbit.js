'use strict';

(function () {

    var context, pushSocket, workerSocket;

    function RabbitMq(queueUri, callback) {
        context = require('rabbit.js').createContext(queueUri);

        context.on('ready', function () {
            pushSocket = context.socket('PUSH');
            workerSocket = context.socket('WORKER');

            if (callback) {
                callback();
            }
        });
    }

    RabbitMq.prototype.sendJson = function (message, routeName) {
        pushSocket.connect(routeName, function () {
            pushSocket.write(JSON.stringify(message));
        });
    };

    RabbitMq.prototype.receiveJson = function (routeName, callback) {
        workerSocket.connect(routeName);
        workerSocket.on('data', function (message) {
            callback(message, this);
        });

    };

    module.exports = RabbitMq;
}());
