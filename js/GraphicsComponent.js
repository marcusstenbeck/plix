define([
    'Component'
], function(
    Component
) {

    function GraphicsComponent() {
        this.type = 'graphicsComponent';

        this.graphic = {
            type: 'shape',
            color: [0, 1, 0, 1],
            shapeData: {
                type: 'rectangle',
                width: 16,
                height: 16
            }
        };
    }
    GraphicsComponent.prototype = Object.create(Component.prototype);

    /*
    GraphicsComponent.prototype.receiveMessage = function(message) {
        console.warn(this, 'receiveMessage() not implemented');
    };
    */

    return GraphicsComponent;
});