define([
], function(
) {
    function Entity(world, name) {
        this.name = name || 'Entity';
        this.world = world;
        this.components = {};
        this.intersect = [];
        this.update = undefined;
        this.draw = undefined;
    }

    Entity.prototype.broadcastMessage = function(message) {
        for(var i = 0; i < this.components.length; i++) {
            this.components[i].receiveMessage(message);
        }
    };

    return Entity;
});