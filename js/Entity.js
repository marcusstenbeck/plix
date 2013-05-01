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
        for(var i = 0; i < this.components.length; i++) {
            this.components[i].receiveMessage(message);
        }
    };

    Entity.prototype.setComponent = function(component) {
        component.entity = this;
        this.components[component.type] = component;
    };

    return Entity;
});