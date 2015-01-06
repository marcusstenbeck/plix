define([
    'plix/ComponentLib'
], function(
    ComponentLib
) {

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

    return Entity;
});