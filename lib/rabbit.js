'use strict';

(function () {

    var context;

    function RabbitMq(queueUri, callback) {
        context = require('rabbit.js').createContext(queueUri);

        context.on('ready', function () {

            if (callback) {
                callback();
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
            callback(message, this);
        });

    };

    module.exports = RabbitMq;
}());
