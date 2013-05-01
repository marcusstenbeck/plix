define([
    'Component'
], function(
    Component
) {

    function PhysicsComponent() {
        this.type = 'physicsComponent';

        this.body = {
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


    /*
     PhysicsComponent.prototype.receiveMessage = function(message) {
     console.warn(this, 'receiveMessage() not implemented');
     };
     */

    return PhysicsComponent;
});