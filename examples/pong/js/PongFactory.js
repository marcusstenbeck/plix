requirejs.config({
    //By default load any module IDs from ../../src
    baseUrl: '../../src',
    //except, if the module ID starts with "app",
    //load it from the ./examples directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        lib: '../../lib'
    }
});
define([
    'plix/Entity',
    'plix/PhysicsComponent',
    'plix/GraphicsComponent',
    'plix/KeyboardInputComponent',
    'plix/FSMComponent',
    'plix/Util',
    'lib/vendor/physix/src/Body'
], function(
    Entity,
    PhysicsComponent,
    GraphicsComponent,
    KeyboardInputComponent,
    FSMComponent,
    Util,
    Body
) {
    'use strict';

    function PongFactory() {}

    PongFactory.createPaddle = function(scene, options) {

        var paddle = scene.createEntity();

        paddle.transform.position.x = options.x;
        paddle.transform.position.y = options.y;
        paddle.size.x = options.width;
        paddle.size.y = options.height;
        

        // Add physics component
        var pc = new PhysicsComponent({
                entity: paddle,
                type: Body.KINEMATIC
            });
        paddle.addComponent(pc);


        // Add input component
        var ic = new KeyboardInputComponent({
            entity: paddle
        });
        paddle.addComponent(ic);

        // Create FSM component
        var fsm = new FSMComponent();
        paddle.addComponent(fsm);

        // Configure FSM
        fsm.createState('default')
            .onEnter(function(ent) {
                ent.script = function() {
                    var xVel = 0;
                    xVel += ent.components.input.keys[options.keys.left] ? -0.5 : 0;
                    xVel += ent.components.input.keys[options.keys.right] ? 0.5 : 0;
                    ent.components.physics.body.vel.x = xVel;
                };
            });
        // TODO: It's dumb to have to require this if we only add one state...
        fsm.enterState('default');

        return paddle;
    };

    PongFactory.createWall = function(scene, options) {

        var wall = scene.createEntity();

        wall.transform.position.x = options.x;
        wall.transform.position.y = options.y;
        wall.size.x = options.width;
        wall.size.y = options.height;

        var pc = new PhysicsComponent({
                entity: wall,
                type: Body.KINEMATIC
            });
        wall.addComponent(pc);

        return wall;
    };

    PongFactory.createBall = function(scene, options) {

        var ball = scene.createEntity();

        ball.transform.position.x = options.x;
        ball.transform.position.y = options.y;
        ball.size.x = options.width;
        ball.size.y = options.height;

        var pc = new PhysicsComponent({
                entity: ball,
                type: Body.DYNAMIC
            });
        ball.addComponent(pc);

        return ball;
    };

    return PongFactory;
});