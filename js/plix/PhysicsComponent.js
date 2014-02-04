define([
    'plix/Component'
], function(
    Component
) {

    function PhysicsComponent() {
        this.type = 'physics';

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
            },

            // kg, can be "STATIC" also
            mass: 1
        };
    }
    PhysicsComponent.prototype = Object.create(Component.prototype);

    PhysicsComponent.prototype.receiveMessage = function(message) {};

    PhysicsComponent.prototype.setEntity = function(entity) {
        this.entity = entity;
        this.body.position.x = entity.transform.position.x;
        this.body.position.y = entity.transform.position.y;

        // TODO: Some kind of foo.addToPhysicsWorld(this);
        // Is the physics world attached to Scene or to PlixApp?
    };

    return PhysicsComponent;
});