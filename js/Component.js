define([

], function(

) {

    function Component() {

    }

    Component.prototype.receiveMessage = function(message) {
        console.warn(this, 'receiveMessage() not implemented');
    };

    return Component;
});