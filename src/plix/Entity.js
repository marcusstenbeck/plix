define([
    'plix/ComponentLib'
], function(
    ComponentLib
) {
    'use strict';

    function Entity(params) {
        if(!params) params = {};

        this._components = {};

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
        Object.keys(this._components).forEach(function(key) {
            _this._components[key].receiveMessage(message);
        });
    };

    Entity.prototype.component = function(componentName, params) {
        if(!params) params = {};

        params.entity = this;

        // Return the component if the entity already has it
        if(this._components[componentName]) return this._components[componentName];

        // Create and return the component if it doesn't exist
        var component = new ComponentLib[componentName](params);
        component.setEntity(this);
        this._components[componentName] = component;

        return component;
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
        var color = this.component('graphics').graphic.color;

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