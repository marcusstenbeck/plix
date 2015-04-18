define([
    'plix/Component'
], function(
    Component
) {
    'use strict';

    /**
     *  Currently this is nothing more than an empty component
     *  that's used to determine whether an entity should be
     *  considered to be a camera.
     */

    function CameraComponent(params) {
        Component.call(this, params);
        if(!params) params = {};

        this.type = 'camera';
    }
    CameraComponent.prototype = Object.create(Component.prototype);

    CameraComponent.prototype.receiveMessage = function() {};

    return CameraComponent;
});