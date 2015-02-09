define([
    'plix/Component'
], function(
    Component
) {
    'use strict';

    function KeyboardInputComponent(params) {
        Component.call(this, params);
        if(!params) params = {};

        this.type = 'input';

        this.keys = {};
    }
    KeyboardInputComponent.prototype = Object.create(Component.prototype);
    KeyboardInputComponent.prototype.constructor = Component;

    KeyboardInputComponent.prototype.receiveMessage = function(message) {
        message = message.split(':');

        // 'keyup' and 'keydown' are the messages we care about
        if(!(message[0] === 'keyup' || message[0] === 'keydown')) return;
        var state = message[0];

        // We're not interested in undefined keys
        if(message[1] === 'undefined') return;
        var key = message[1];

        // At this point we know that it's either
        // a keyup or a keydown event, and that the
        // key isn't undefined
        this.keys[key] = state === 'keydown' ? true : false;
    };

    KeyboardInputComponent.prototype.setEntity = function(entity) {
        this.entity = entity;
    };

    return KeyboardInputComponent;
});