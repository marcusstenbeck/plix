define([

], function(

) {

    function Component() {
        this.entity = null;
    }

    Component.prototype.setEntity = function(entity) {
        this.entity = entity;
    };

    Component.prototype.receiveMessage = function(message) {
        console.warn(this, 'receiveMessage() not implemented', message);
    };

    return Component;
});