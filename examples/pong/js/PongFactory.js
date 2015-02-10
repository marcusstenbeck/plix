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
    'plix/Scene',
    'plix/PhysicsComponent',
    'plix/GraphicsComponent',
    'plix/KeyboardInputComponent',
    'plix/FSMComponent',
    'plix/Util',
    'lib/vendor/physix/src/Body',
    'lib/vendor/physix/src/Vec2'
], function(
    Entity,
    Scene,
    PhysicsComponent,
    GraphicsComponent,
    KeyboardInputComponent,
    FSMComponent,
    Util,
    Body,
    Vec2
) {
    'use strict';

    function PongFactory() {}

    PongFactory.createPaddle = function(scene, options) {

        var paddle = new Entity();
        scene.attachEntity(paddle);

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

        var wall = new Entity();
        scene.attachEntity(wall);

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

        var ball = new Entity();
        scene.attachEntity(ball);

        ball.transform.position.x = options.x;
        ball.transform.position.y = options.y;
        ball.size.x = options.width;
        ball.size.y = options.height;

        var pc = new PhysicsComponent({
                entity: ball,
                type: Body.DYNAMIC
            });
        ball.addComponent(pc);

        ball.script = function(ent) {
            if(ent.scene.app.input.keyboard.L) {
                ent.scene.app.popScene();
            }
        };

        return ball;
    };

    PongFactory.createLevel = function(app) {

        /**
         * Create main scene
         */
        var scene = new Scene('main');


        /**
         *  Walls
         */

        // Top wall
        PongFactory.createWall(scene, {
            x: app.width/2,
            y: -10,
            width: app.width,
            height: 20
        });

        // Bottom wall
        PongFactory.createWall(scene, {
            x: app.width/2,
            y: app.height + 10,
            width: app.width,
            height: 20
        });

        // Left wall
        PongFactory.createWall(scene, {
            x: -9,
            y: app.height/2,
            width: 20,
            height: app.height
        });

        // Right wall
        PongFactory.createWall(scene, {
            x: app.width + 10,
            y: app.height/2,
            width: 20,
            height: app.height
        });


        /**
         *  Paddles
         */

        // Create paddle 1
        PongFactory.createPaddle(scene, {
            x: 100,
            y: app.height - 50,
            width: 100,
            height: 10,
            keys: { left: 'A', right: 'S' }
        });

        // Create paddle 2
        PongFactory.createPaddle(scene, {
            x: 200,
            y: 50,
            width: 100,
            height: 10,
            keys: { left: 'K', right: 'L' }
        });


        /**
         *  Ball
         */

        // Create ball
        var ball = PongFactory.createBall(scene, {
            x: app.width/2,
            y: app.height/2,
            width: 10,
            height: 10
        });
        ball.components.physics.body.applyForce(new Vec2(0.001, 0.01));

        return scene;
    };

    PongFactory.createMenu = function(app) {

        /**
         * Create menu scene
         */
        var scene = new Scene('menu');

        var ent = new Entity();
        scene.attachEntity(ent);

        ent.transform.position.x = app.width / 2;
        ent.transform.position.y = app.height / 2;
        ent.size.x = 100;
        ent.size.y = 20;

        ent.script = function(ent) {
            if(ent.scene.app.input.mouse.leftButton) {
                ent.scene.app.pushScene(PongFactory.createLevel(ent.scene.app));
            }
            console.log('na');
        };

        return scene;
    };

    return PongFactory;
});