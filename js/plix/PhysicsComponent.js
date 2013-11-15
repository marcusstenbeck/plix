define([
    'plix/Component'
], function(
    Component
) {

    function PhysicsComponent() {
        this.type = 'physicsComponent';

        this.body = {
            size: {
                x: 32,
                y: 32
            },

            position: {
                x: 0,
                y: 0
            },

            velocity: {
                x: 0,
                y: 0
            },

            acceleration: {
                x: 0,
                y: 0
            }
        };
    }
    PhysicsComponent.prototype = Object.create(Component.prototype);

    PhysicsComponent.prototype.receiveMessage = function(message) {};

    PhysicsComponent.prototype.setEntity = function(entity) {
        this.entity = entity;
        this.body.position = entity.position;
    };

    return PhysicsComponent;
});