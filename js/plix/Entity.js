define([

], function(

) {

    function Entity() {
        this.components = {};

        this.size = { x:1, y:1 };

        this.transform = {
            position: { x:0, y:0 },
            rotation: 0,
            scale: { x:0, y:0 }
        };

        this.layer = null;
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

    Entity.prototype.attachToLayer = function (layer) {
        layer.attachEntity();
        this.layer = layer;
    };

    Entity.prototype.destroy = function() {
        var index = this.layer.entities.indexOf(this);

        // Remove the entity from the layer list
        this.layer.entities.splice(index, 1);
    };

    return Entity;
});