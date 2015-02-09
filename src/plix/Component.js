define([

], function(

) {
    'use strict';

    function Component(params) {
    	if(!params) params = {};

        this.entity = params.entity ? params.entity : undefined;
        if(!this) {
            console.warn('No entity to attach component to!');
        }
    }

    Component.prototype.setEntity = function(entity) {
        this.entity = entity;
    };

    Component.prototype.receiveMessage = function(message) {
        console.warn(this, 'receiveMessage() not implemented', message);
    };

    return Component;
});