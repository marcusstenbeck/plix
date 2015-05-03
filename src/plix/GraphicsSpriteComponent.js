define([
    'plix/Component'
], function(
    Component
) {
    'use strict';

    function GraphicsSpriteComponent(params) {
        Component.call(this, params);
        if(!params) params = {};

        var img = new Image();
        img.src = params.imagePath;
        img.onload = function () {
            img.isLoaded = true;
            console.log('loaded image');
        };

        this.graphic = {
            type: 'sprite',
            image: img,
            isLoaded: false,
            scale: { x: 1, y: 1 },
            shapeData: {
                type: 'rectangle',
                width: params.width,
                height: params.height
            }
        };
    }
    GraphicsSpriteComponent.prototype = Object.create(Component.prototype);

    GraphicsSpriteComponent.prototype.receiveMessage = function() {};

    return GraphicsSpriteComponent;
});