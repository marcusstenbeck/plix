define([
    'plix/GraphicsComponent'
], function(
    GraphicsComponent
) {
    'use strict';

    function Entity(params) {
        if(!params) params = {};

        this.components = {};

        this.size = { x:1, y:1 };

        this.transform = {
            position: { x:0, y:0 },
            rotation: 0,
            scale: { x:0, y:0 }
        };

        this.scene = params.scene || null;
        this.data = {};
    }

    Entity.prototype.broadcastMessage = function(message) {
        var _this = this;
        Object.keys(this.components).forEach(function(key) {
            _this.components[key].receiveMessage(message);
        });
    };

    Entity.prototype.addComponent = function(component) {
        if(!component.type) {
            console.warn('No component type!!!');
            return;
        }

        // Set the component's entity to this
        component.setEntity(this);

        // Add component to components
        this.components[component.type] = component;
    };

    Entity.prototype.attachToScene = function (scene) {
        scene.attachEntity(this);
        this.scene = scene;
    };

    Entity.prototype.destroy = function() {
        var index = this.scene.entities.indexOf(this);

        // Remove the entity from the scene list
        this.scene.entities.splice(index, 1);
    };

    Entity.prototype.render = function(ctx) {
        // Get color from entity

        if(!this.components.graphics) {
            this.addComponent(new GraphicsComponent({ entity: this }));
        }
        var color = this.components.graphics.graphic.color;

        ctx.strokeStyle = 'rgba(' + (255 * color[0]) + ',' + (255 * color[1]) + ',' + (255 * color[2]) + ',' + (255 * color[3]) + ')';

        
        ctx.beginPath();
        ctx.moveTo(this.transform.position.x - 2.5, this.transform.position.y - 2.5);
        ctx.lineTo(this.transform.position.x + 2.5, this.transform.position.y + 2.5);
        ctx.moveTo(this.transform.position.x + 2.5, this.transform.position.y - 2.5);
        ctx.lineTo(this.transform.position.x - 2.5, this.transform.position.y + 2.5);

        ctx.stroke();

        ctx.strokeRect(this.transform.position.x - this.size.x/2 + 0.5,
                            this.transform.position.y - this.size.y/2 + 0.5,
                            this.size.x - 1,
                            this.size.y - 1);
    };

    return Entity;
});