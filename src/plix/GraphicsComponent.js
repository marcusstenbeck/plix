define([
    'plix/Component'
], function(
    Component
) {
    'use strict';

    function GraphicsComponent(params) {
        Component.call(this, params);
        if(!params) params = {};

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

    GraphicsComponent.prototype.setSprite = function (options) {
        options = options || {};

        var img = new Image();
        img.src = options.imagePath;
        img.onload = function () {
            img.isLoaded = true;
            console.log('loaded image');
        };

        this.graphic = {
            type: 'sprite',
            image: img,
            isLoaded: false,
            shapeData: {
                type: 'rectangle',
                width: options.width,
                height: options.height
            }
        };
    };

    return GraphicsComponent;
});