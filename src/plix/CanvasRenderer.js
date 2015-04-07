define([
], function(
) {
    'use strict';

    function CanvasRenderer(params) {
        if(!params) params = {};

        this.canvas = params.canvas;

        this.context = this.canvas.getContext('2d');
    }

    CanvasRenderer.prototype.render = function(scene) {

        var cameraComponent;

        // YOLO: choose the first occurence of the camera
        var entity;
        for(var i = 0; i < scene.entities.length; i++) {
            var entity = scene.entities[i];

            if(entity.components['camera']) {
                cameraComponent = entity.components.camera;
            }
        }

        if(!!cameraComponent) {
            this._renderWithCamera({
                cameraComponent: cameraComponent,
                scene: scene
            });
        } else {
            this._renderWithoutCamera(scene);
        }
    };

    CanvasRenderer.prototype._renderWithoutCamera = function(scene) {
        var ctx = this.context;

        // Wipe the canvas clean
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fillRect(0, 0, scene.app.canvas.width, scene.app.canvas.height);

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

            if(entity.components.physics) {
                ctx.strokeRect(entity.transform.position.x - entity.components.physics.body.shape.width/2 + 0.5,
                                    entity.transform.position.y - entity.components.physics.body.shape.height/2 + 0.5,
                                    entity.components.physics.body.shape.width - 1,
                                    entity.components.physics.body.shape.height - 1);
            }
        });
    };

    CanvasRenderer.prototype._renderWithCamera = function(options) {
        options || (options = {});

        var scene = options.scene;
        var camPosition = {
            x: options.cameraComponent.entity.transform.position.x - (scene.app.width / 2),
            y: options.cameraComponent.entity.transform.position.y - (scene.app.height / 2)
        }


        var ctx = this.context;

        // Wipe the canvas clean
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fillRect(0, 0, scene.app.canvas.width, scene.app.canvas.height);

        scene.entities.forEach(function(entity) {
            // Get color from entity
            var color = entity.components.graphics.graphic.color;

            ctx.strokeStyle = 'rgba(' + (255 * color[0]) + ',' + (255 * color[1]) + ',' + (255 * color[2]) + ',' + (255 * color[3]) + ')';

        
            ctx.beginPath();
            ctx.moveTo(entity.transform.position.x - 2.5 - camPosition.x, entity.transform.position.y - 2.5 - camPosition.y);
            ctx.lineTo(entity.transform.position.x + 2.5 - camPosition.x, entity.transform.position.y + 2.5 - camPosition.y);
            ctx.moveTo(entity.transform.position.x + 2.5 - camPosition.x, entity.transform.position.y - 2.5 - camPosition.y);
            ctx.lineTo(entity.transform.position.x - 2.5 - camPosition.x, entity.transform.position.y + 2.5 - camPosition.y);

            ctx.stroke();

            if(entity.components.physics) {
                ctx.strokeRect(entity.transform.position.x - entity.components.physics.body.shape.width/2 + 0.5 - camPosition.x,
                                    entity.transform.position.y - entity.components.physics.body.shape.height/2 + 0.5 - camPosition.y,
                                    entity.components.physics.body.shape.width - 1,
                                    entity.components.physics.body.shape.height - 1);
            }
        });
    };

    return CanvasRenderer;
});