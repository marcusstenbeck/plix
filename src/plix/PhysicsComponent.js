define([
    'plix/Component',
    'lib/vendor/physix/src/Vec2',
    'lib/vendor/physix/src/Body',
    'lib/vendor/physix/src/World'
], function(
    Component,
    Vec2,
    Body,
    World
) {
    'use strict';

    function PhysicsComponent(params) {
        Component.call(this, params);
        if(!params) params = {};

        // Component type
        this.type = 'physics';

        // Set up physics body
        this.body = new Body();
        this.body.pos = new Vec2(this.entity.transform.position.x, this.entity.transform.position.y);
        this.body.shape.width = params.width || 1;
        this.body.shape.height = params.height || 1;
        this.body.type = params.type || Body.DYNAMIC;
        this.body.tag = params.tag || '';

        if(typeof params.onCollision === 'function') {
            this.body.onCollision = params.onCollision;
        }

        if(!this.entity.scene._physicsWorld) {
            this.entity.scene._physicsWorld = new World();
        }

        this.entity.scene._physicsWorld.bodies.push(this.body);
    }
    PhysicsComponent.prototype = Object.create(Component.prototype);
    PhysicsComponent.prototype.constructor = Component;

    PhysicsComponent.prototype.receiveMessage = function() {};

    PhysicsComponent.prototype.setEntity = function(entity) {
        this.entity = entity;
    };

    return PhysicsComponent;
});