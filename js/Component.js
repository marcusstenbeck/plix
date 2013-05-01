define([

], function(

) {

    function Component() {
        this.entity = null;
    }

    Component.prototype.receiveMessage = function(message) {
        console.warn(this, 'receiveMessage() not implemented');
    };

    return Component;
});