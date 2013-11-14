define([

], function(

) {

    function Entity(world, name) {
        this.name = name || 'Entity';
        this.world = world;
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

    Entity.prototype.addToWorld = function () {
        this.world.entities.push(this);
    };

    Entity.prototype.destroy = function() {
        var index = this.world.entities.indexOf(this);

        // Remove the entity from the world list
        this.world.entities.splice(index, 1);
    };

    return Entity;
});