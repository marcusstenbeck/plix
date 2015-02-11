define([
], function(
) {
    'use strict';

    function Renderer(params) {
        if(!params) params = {};

        this.context = params.context;
    }

    Renderer.prototype.render = function(scene) {
        var ctx = this.context;
        scene.entities.forEach(function(entity) {
            // Get color from entity
            var color = entity.components.graphics.graphic.color;

            ctx.strokeStyle = 'rgba(' + (255 * color[0]) + ',' + (255 * color[1]) + ',' + (255 * color[2]) + ',' + (255 * color[3]) + ')';

        
            ctx.beginPath();
            ctx.moveTo(entity.transform.position.x - 2.5, entity.transform.position.y - 2.5);
            ctx.lineTo(entity.transform.position.x + 2.5, entity.transform.position.y + 2.5);
            ctx.moveTo(entity.transform.position.x + 2.5, entity.transform.position.y - 2.5);
            ctx.lineTo(entity.transform.position.x - 2.5, entity.transform.position.y + 2.5);

            ctx.stroke();

            ctx.strokeRect(entity.transform.position.x - entity.size.x/2 + 0.5,
                                entity.transform.position.y - entity.size.y/2 + 0.5,
                                entity.size.x - 1,
                                entity.size.y - 1);
        });
    };

    return Renderer;
});

    // Scene.prototype.render = function(ctx) {
    //     this.entities.forEach(function(entity) {
    //         entity.render(ctx);
    //     });
    // };

// Entity.prototype.render = function(ctx) {
//         
//     };