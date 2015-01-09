define([

], function(

) {

    function Component(params) {
    	if(!params) params = {};

        this.entity = params.entity ? params.entity : undefined;
    }

    Component.prototype.setEntity = function(entity) {
        this.entity = entity;
    };

    Component.prototype.receiveMessage = function(message) {
        console.warn(this, 'receiveMessage() not implemented', message);
    };

    return Component;
});