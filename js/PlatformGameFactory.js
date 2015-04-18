requirejs.config({
    //By default load any module IDs from ../../src
    baseUrl: './basepoo',
    //except, if the module ID starts with "app",
    //load it from the ./examples directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        lib: './smoooz/lib',
    }
});
define([
    'plix/Entity',
    'plix/Scene',
    'plix/PhysicsComponent',
    'plix/GraphicsComponent',
    'plix/KeyboardInputComponent',
    'plix/FsmComponent',
    'plix/CameraComponent',
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
    CameraComponent,
    Util,
    Body,
    Vec2
) {
    'use strict';

    var PHYSICS_LAYER_ONE = 0b01;
    var PHYSICS_LAYER_TWO = 0b10;

    function PlatformGameFactory() {}

    PlatformGameFactory.createPlayer = function(scene, options) {

        var playerEntity = new Entity();
        scene.attachEntity(playerEntity);

        playerEntity.transform.position.x = options.x;
        playerEntity.transform.position.y = options.y;
        

        // Add physics component
        var pc = new PhysicsComponent({
                entity: playerEntity,
                type: Body.DYNAMIC,
                width: options.width,
                height: options.height,
                tag: 'player',
                layer: PHYSICS_LAYER_ONE
            });
        pc.on('collision', function(otherBody, collisionVector) {
            if(
                Math.abs(collisionVector.x) < 
                Math.abs(collisionVector.y) && 
                collisionVector.y < 0) {
                // Landed, so don't bounce!
                this.body.vel.y = 0;

                // Trigger grounded state
                playerEntity.components.fsm._fsm.triggerEvent('ground');
            }

            if(otherBody.tag === 'goal') {
                scene.app.nextLevel();
            }

            if(otherBody.tag === 'enemy') {
                scene.app.playerDied();
            }
        });
        playerEntity.addComponent(pc);


        // Add input component
        var ic = new KeyboardInputComponent({
            entity: playerEntity
        });
        playerEntity.addComponent(ic);

        // Create FSM component
        var fsm = new FSMComponent();
        playerEntity.addComponent(fsm);

        var sideMove = function(ent) {
            var xForce = 0;
            xForce += ent.components.input.keys[options.keys.left] ? -0.01 : 0;
            xForce += ent.components.input.keys[options.keys.right] ? 0.01 : 0;

            if(xForce !== 0) {
                ent.components.physics.body.applyForce({ x: xForce, y: 0 });
            }
            ent.components.physics.body.vel.x *= 0.8;
        };

        // Configure FSM
        fsm.createState('grounded')
            .onEnter(function(ent) {
                ent.script = function() {
                    sideMove(ent);

                    if(ent.components.input.keys[options.keys.jump]) {
                        // Add jumping force
                        ent.components.physics.body.applyForce({
                            x: 0,
                            y: -0.1
                        });

                        // Trigger jump event
                        fsm._fsm.triggerEvent('jump');
                    }
                };
            })
            .addTransition('jump', 'jumping');

        fsm.createState('jumping')
            .onEnter(function(ent) {
                ent.script = sideMove;
            })
            .addTransition('ground', 'grounded');
        
        // Start in the jumping state
        fsm.enterState('jumping');

        return playerEntity;
    };

    PlatformGameFactory.createWall = function(scene, options) {

        var wall = new Entity();
        scene.attachEntity(wall);

        wall.transform.position.x = options.x;
        wall.transform.position.y = options.y;

        var pc = new PhysicsComponent({
                tag: options.tag || 'wall',
                entity: wall,
                type: Body.KINEMATIC,
                width: options.width,
                height: options.height,
                layer: PHYSICS_LAYER_ONE | PHYSICS_LAYER_TWO
            });
        wall.addComponent(pc);

        return wall;
    };

    PlatformGameFactory.createEnemy = function(scene, options) {
        options = options || {};

        options.tag = 'enemy';

        var enemy = this.createWall(scene, options);

        enemy.components.graphics.graphic.color = [1, 0, 0, 1];

        return enemy;
    };

    PlatformGameFactory.createPickup = function(scene, options) {
        options = options || {};

        options.tag = 'pickup';
        options.width = options.width || 15;
        options.height = options.height || 15;

        function spawnFrag(scene, options) {
            options = options || {};

            var frag = new Entity();
            scene.attachEntity(frag);

            frag.transform.position.x = options.xPos;
            frag.transform.position.y = options.yPos;

            // Add physics component
            var pc = new PhysicsComponent({
                mass: 1,
                entity: frag,
                type: Body.DYNAMIC,
                width: options.width,
                height: options.height,
                tag: 'frag',
                layer: PHYSICS_LAYER_TWO
            });
            frag.addComponent(pc);

            var timeUntilDestroy = 1000 + 500*Math.random();
            setTimeout(function() {
                frag.destroy();
            }, timeUntilDestroy);

            // var scale = 0.0001;
            pc.body.applyForce(options.f);

            frag.components.graphics.graphic.color = [1, 1, 0, 1];
        }

        var pickup = this.createWall(scene, options);

        pickup.components.graphics.graphic.color = [1, 1, 0, 1];
        pickup.components.physics.body.isSensor = true;
        pickup.components.physics.on('collision', function(otherBody, collisionVector) {
            if(otherBody.tag === 'player') {
                console.log('yo i am a pickup and i got picked up');

                var w = this.body.shape.width/2;
                var h = this.body.shape.height/2;

                var collisionDirection = new Vec2(collisionVector.x, collisionVector.y);
                collisionDirection.normalize();
                collisionDirection.x *= -10;
                collisionDirection.y *= -10;
                var scale = 0.001;

                spawnFrag(this.entity.scene, { width: w, height: h, xPos: this.entity.transform.position.x + w/2, yPos: this.entity.transform.position.y + h/2, f: new Vec2(scale * (1 + collisionDirection.x), scale * (-40 + collisionDirection.y)) });
                spawnFrag(this.entity.scene, { width: w, height: h, xPos: this.entity.transform.position.x + w/2, yPos: this.entity.transform.position.y - h/2, f: new Vec2(scale * (0.5 + collisionDirection.x), scale * (-30 + collisionDirection.y)) });
                spawnFrag(this.entity.scene, { width: w, height: h, xPos: this.entity.transform.position.x - w/2, yPos: this.entity.transform.position.y + h/2, f: new Vec2(scale * (-2 + collisionDirection.x), scale * (-40 + collisionDirection.y)) });
                spawnFrag(this.entity.scene, { width: w, height: h, xPos: this.entity.transform.position.x - w/2, yPos: this.entity.transform.position.y - h/2, f: new Vec2(scale * (-0.5 + collisionDirection.x), scale * (-30 + collisionDirection.y)) });

                this.entity.destroy();
            }
        });
                   

        return pickup;
    };

    PlatformGameFactory.createLevel = function(levelNumber) {
        if(!levelNumber) return;

        switch(levelNumber) {
            case 1:
                return this.createLevel1();

            case 2:
                return this.createLevel2();

            case 3:
                return this.createLevel3();
        }
    };

    PlatformGameFactory.createLevel1 = function() {

        /**
         * Create main scene
         */
        var scene = new Scene('main');

        // Create player
        var player = PlatformGameFactory.createPlayer(scene, {
            x: -200,
            y: -80,
            width: 50,
            height: 70,
            keys: {
                left: 'A',
                right: 'S',
                jump: 'K'
            }
        });

        // We want the camera to follow the player
        PlatformGameFactory.createCamera(scene, {
            follow: player
        });

        // Create a floor
        PlatformGameFactory.createWall(scene, {
            x: 0,
            y: -20,
            width: 2400,
            height: 20
        });

        // Create the little floor obstacle
        PlatformGameFactory.createWall(scene, {
            x: 30,
            y: -45,
            width: 30,
            height: 30
        });

        PlatformGameFactory.createPickup(scene, {
            x: 200,
            y: -180
        });

        // Create a goal
        PlatformGameFactory.createWall(scene, {
            x: 500,
            y: -60,
            width: 30,
            height: 30,
            tag: 'goal'
        });

        // TODO: Be able to set gravity!!!
        if(scene._physicsWorld) {
            console.log('set gravity');
            scene._physicsWorld.gravity = new Vec2(0, 0.005);
        }


        return scene;
    };

    PlatformGameFactory.createLevel2 = function() {

        /**
         * Create main scene
         */
        var scene = new Scene('main');

        // Create player
        var player = PlatformGameFactory.createPlayer(scene, {
            x: -200,
            y: -80,
            width: 50,
            height: 70,
            keys: {
                left: 'A',
                right: 'S',
                jump: 'K'
            }
        });

        // We want the camera to follow the player
        PlatformGameFactory.createCamera(scene, {
            follow: player
        });

        // Create a floor
        PlatformGameFactory.createWall(scene, {
            x: 0,
            y: -20,
            width: 2400,
            height: 20
        });

        // Create the little floor obstacle
        PlatformGameFactory.createWall(scene, {
            x: 30,
            y: -45,
            width: 30,
            height: 30
        });

        // Create the little floor obstacle
        PlatformGameFactory.createWall(scene, {
            x: 30,
            y: -85,
            width: 30,
            height: 30
        });

        // Create a goal
        PlatformGameFactory.createWall(scene, {
            x: 500,
            y: -60,
            width: 30,
            height: 30,
            tag: 'goal'
        });

        // TODO: Be able to set gravity!!!
        if(scene._physicsWorld) {
            console.log('set gravity');
            scene._physicsWorld.gravity = new Vec2(0, 0.005);
        }


        return scene;
    };

    PlatformGameFactory.createLevel3 = function() {

        /**
         * Create main scene
         */
        var scene = new Scene('main');

        // Create player
        var player = PlatformGameFactory.createPlayer(scene, {
            x: -200,
            y: -80,
            width: 50,
            height: 70,
            keys: {
                left: 'A',
                right: 'S',
                jump: 'K'
            }
        });

        // We want the camera to follow the player
        PlatformGameFactory.createCamera(scene, {
            follow: player
        });

        // Create a floor
        PlatformGameFactory.createWall(scene, {
            x: 0,
            y: -20,
            width: 2400,
            height: 20
        });

        // Create the little floor obstacle
        PlatformGameFactory.createWall(scene, {
            x: 30,
            y: -45,
            width: 30,
            height: 30
        });

        // Create the little floor obstacle
        PlatformGameFactory.createWall(scene, {
            x: 200,
            y: -120,
            width: 30,
            height: 30
        });

        // Create the little floor obstacle
        PlatformGameFactory.createWall(scene, {
            x: 350,
            y: -180,
            width: 30,
            height: 30
        });

        // Create a goal
        PlatformGameFactory.createWall(scene, {
            x: 500,
            y: -300,
            width: 30,
            height: 30,
            tag: 'goal'
        });

        // Create an enemy
        PlatformGameFactory.createEnemy(scene, {
            x: 500,
            y: -60,
            width: 600,
            height: 30
        });

        PlatformGameFactory.createPickup(scene, {
            x: 390,
            y: -250
        });

        // TODO: Be able to set gravity!!!
        if(scene._physicsWorld) {
            console.log('set gravity');
            scene._physicsWorld.gravity = new Vec2(0, 0.005);
        }


        return scene;
    };

    PlatformGameFactory.createMenu = function(app) {

        var figLayout = [
            [1, 1, 1,  0,  1, 0, 1,  0,  1, 0, 1,  0,  1, 1, 1],
            [0, 0, 1,  0,  1, 0, 1,  0,  1, 1, 1,  0,  1, 0, 1],
            [0, 0, 1,  0,  1, 0, 1,  0,  1, 0, 1,  0,  1, 1, 1],
            [1, 0, 1,  0,  1, 0, 1,  0,  1, 0, 1,  0,  1, 0, 0],
            [1, 1, 1,  0,  1, 1, 1,  0,  1, 0, 1,  0,  1, 0, 0],

            [0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0],
            [0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0,  0,  0, 0, 0],

            [0, 0, 0,  0,  1, 1, 0,  0,  1, 0, 1,  0,  1, 1, 0,  0,  1, 1, 1],
            [0, 0, 0,  0,  1, 0, 1,  0,  1, 0, 1,  0,  1, 0, 1,  0,  1, 0, 0],
            [0, 0, 0,  0,  1, 0, 1,  0,  1, 0, 1,  0,  1, 0, 1,  0,  1, 1, 0],
            [0, 0, 0,  0,  1, 0, 1,  0,  1, 0, 1,  0,  1, 0, 1,  0,  1, 0, 0],
            [0, 0, 0,  0,  1, 1, 0,  0,  1, 1, 1,  0,  1, 1, 0,  0,  1, 1, 1]
        ];

        /**
         * Create menu scene
         */
        var scene = new Scene('menu');

        // The following code draws the "text" in figLayout
        var ent;
        for(var r = 0; r < figLayout.length; r++) {
            for(var c = 0; c < figLayout[r].length; c++) {
                if(figLayout[r][c]) {

                    ent = new Entity();
                    scene.attachEntity(ent);

                    ent.transform.position.x = 10*c - 85 + (app.width / 2);
                    ent.transform.position.y = 10*r - 100 + (app.height / 2);
                }
            }
        }


        ent.script = function(ent) {
            if(ent.scene.app.input.mouse.leftButton) {
                ent.scene.app.pushScene(PlatformGameFactory.createLevel1(ent.scene.app));
            }
        };

        return scene;
    };

    PlatformGameFactory.createCamera = function(scene, options) {
        options = options || {};

        var camera = new Entity();

        scene.attachEntity(camera);

        var cc = new CameraComponent();
        
        // YOLO: ducktyping cc.follow on there
        cc.follow = options.follow;

        camera.addComponent(cc);

        camera.script = function(ent) {
            // YOLO: ent.components.camera.follow is totally ducktyped
            ent.transform.position.x += 0.1 * (ent.components.camera.follow.transform.position.x - ent.transform.position.x);// + 30 * Math.cos(scene.app.timeElapsed * 0.005);
            ent.transform.position.y += 0.1 * (ent.components.camera.follow.transform.position.y - ent.transform.position.y);// + 30 * Math.sin(scene.app.timeElapsed * 0.005);
        };

        return camera;
    };

    return PlatformGameFactory;
});