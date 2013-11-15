define([

], function(

) {

    function Entity(scene, name) {
        this.name = name || 'Entity';
        this.scene = scene;
        this.components = {};
        this.intersect = [];
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

    Entity.prototype.addToScene = function () {
        this.scene.entities.push(this);
    };

    Entity.prototype.destroy = function() {
        var index = this.scene.entities.indexOf(this);

        // Remove the entity from the scene list
        this.scene.entities.splice(index, 1);
    };

    return Entity;
});