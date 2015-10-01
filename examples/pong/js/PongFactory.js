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
        

        // Add physics component
        var pc = new PhysicsComponent({
                entity: paddle,
                type: Body.KINEMATIC,
                width: options.width,
                height: options.height
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

        var pc = new PhysicsComponent({
                tag: options.tag || 'wall',
                entity: wall,
                type: Body.KINEMATIC,
                width: options.width,
                height: options.height
            });
        wall.addComponent(pc);

        return wall;
    };

    PongFactory.createBall = function(scene, options) {

        var ball = new Entity();
        scene.attachEntity(ball);

        ball.transform.position.x = options.x;
        ball.transform.position.y = options.y;

        var pc = new PhysicsComponent({
                tag: 'ball',
                entity: ball,
                type: Body.DYNAMIC,
                width: options.width,
                height: options.height,
                onCollision: function(otherBody) {
                    if(otherBody.tag === 'goal1' || otherBody.tag === 'goal2') {
                        console.log('Goal collision!', otherBody.tag);
                        ball.scene.app.popScene();
                    }
                }
            });
        ball.addComponent(pc);

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
            height: 20,
            tag: 'goal1'
        });

        // Bottom wall
        PongFactory.createWall(scene, {
            x: app.width/2,
            y: app.height + 10,
            width: app.width,
            height: 20,
            tag: 'goal2'
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

        // Give the bal a little push
        ball.components.physics.body.applyForce(new Vec2(
                (Math.random()-0.5)*0.1,
                Math.sign(Math.random()-0.5) * Math.max(Math.random()*0.05, 0.01)
            ));

        return scene;
    };

    PongFactory.createMenu = function(app) {

        var figLayout = [
            [0, 1, 1,  0,  1, 0, 0,  0,  1, 1, 1,  0,  0, 1, 1,  0,  1, 0, 1],
            [1, 0, 0,  0,  1, 0, 0,  0,  0, 1, 0,  0,  1, 0, 0,  0,  1, 1, 0],
            [1, 0, 0,  0,  1, 0, 0,  0,  0, 1, 0,  0,  1, 0, 0,  0,  1, 0, 0],
            [1, 0, 0,  0,  1, 0, 0,  0,  0, 1, 0,  0,  1, 0, 0,  0,  1, 1, 0],
            [0, 1, 1,  0,  1, 1, 1,  0,  1, 1, 1,  0,  0, 1, 1,  0,  1, 0, 1],

            [0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0],
            [0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0],

            [0, 0, 0,  0,  0, 0, 0,  0,  1, 1, 0,  0,  0, 0, 0,  0,  0, 0, 0],
            [0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 1,  0,  0, 0, 0,  0,  0, 0, 0],
            [0, 0, 0,  0,  0, 0, 0,  0,  0, 1, 0,  0,  0, 0, 0,  0,  0, 0, 0],
            [0, 0, 0,  0,  0, 0, 0,  0,  1, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0],
            [0, 0, 0,  0,  0, 0, 0,  0,  1, 1, 1,  0,  0, 0, 0,  0,  0, 0, 0],

            [0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0],
            [0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0],

            [0, 1, 1,  0,  1, 1, 1,  0,  0, 1, 0,  0,  1, 1, 0,  0,  1, 1, 1],
            [1, 0, 0,  0,  0, 1, 0,  0,  1, 0, 1,  0,  1, 0, 1,  0,  0, 1, 0],
            [0, 1, 0,  0,  0, 1, 0,  0,  1, 1, 1,  0,  1, 1, 0,  0,  0, 1, 0],
            [0, 0, 1,  0,  0, 1, 0,  0,  1, 0, 1,  0,  1, 0, 1,  0,  0, 1, 0],
            [1, 1, 0,  0,  0, 1, 0,  0,  1, 0, 1,  0,  1, 0, 1,  0,  0, 1, 0]
        ];

        /**
         * Create menu scene
         */
        var scene = new Scene('menu');

        var ent;
        for(var r = 0; r < figLayout.length; r++) {
            for(var c = 0; c < figLayout[r].length; c++) {
                if(figLayout[r][c]) {

                    ent = new Entity();
                    scene.attachEntity(ent);

                    ent.transform.position.x = 10*c - 85 + (app.width / 2);
                    ent.transform.position.y = -(10*r - 100) + (app.height / 2);
                }
            }
        }


        ent.script = function(ent) {
            if(ent.scene.app.input.mouse.leftButton) {
                ent.scene.app.pushScene(PongFactory.createLevel(ent.scene.app));
            }
        };

        return scene;
    };

    return PongFactory;
});