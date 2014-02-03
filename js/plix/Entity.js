define([

], function(

) {

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
    }

    Entity.prototype.broadcastMessage = function(message) {
        var _this = this;
        Object.keys(this.components).forEach(function(key) {
            _this.components[key].receiveMessage(message);
        });
    };

    Entity.prototype.setComponent = function(component) {
        component.setEntity(this);
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

    return Entity;
});