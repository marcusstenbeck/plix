define([
    'plix/Component'
], function(
    Component
) {
    'use strict';

    function GraphicsComponent() {
        this.type = 'graphics';

        this.graphic = {
            type: 'shape',
            color: [0, 1, 0, 1],
            shapeData: {
                type: 'rectangle',
                width: 32,
                height: 32
            }
        };
    }
    GraphicsComponent.prototype = Object.create(Component.prototype);

    GraphicsComponent.prototype.receiveMessage = function() {};

    return GraphicsComponent;
});