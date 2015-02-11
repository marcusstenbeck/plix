define([
    'plix/GraphicsComponent'
], function(
    GraphicsComponent
) {
    'use strict';

    function Entity(params) {
        if(!params) params = {};

        this.components = {};

        this.transform = {
            position: { x:0, y:0 },
            rotation: 0
        };

        this.components.graphics = new GraphicsComponent({ entity: this });

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
            console.warn('No component type!!!', component);
            return;
        }

        // Set the component's entity to this
        component.setEntity(this);

        // Add component to components
        this.components[component.type] = component;
    };

    Entity.prototype.destroy = function() {
        var index = this.scene.entities.indexOf(this);

        // Remove the entity from the scene list
        this.scene.entities.splice(index, 1);
    };

    return Entity;
});