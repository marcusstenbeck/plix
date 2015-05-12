requirejs.config({
    //By default load any module IDs from ../../src
    baseUrl: './',
    //except, if the module ID starts with "app",
    //load it from the ./examples directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        lib: './lib',
    }
});
define([
    'plix/Entity',
    'plix/Scene',
    'plix/PhysicsComponent',
    'plix/GraphicsSpriteComponent',
    'plix/Graphics3DComponent',
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
    GraphicsSpriteComponent,
    Graphics3DComponent,
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
    var finished = false;

    function easeOutElastic(duration, time) {
        var t = time;
        var b = 0;
        var c = 1;
        var d = duration;

        var s=1.70158; var p=0; var a=c;
        if (t===0) return b;  if ((t/=d)===1) return b+c;  if (!p) p=d*0.3;
        if (a < Math.abs(c)) { a=c; s=p/4; }
        else s = p/(2*Math.PI) * Math.asin (c/a);
        return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    }

    function easeOutExpo(duration, time) {
        var t = time;
        var b = 0;
        var c = 1;
        var d = duration;

        return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
    }

    function easeOutBounce(duration, time) {
        var t = time;
        var b = 0;
        var c = 1;
        var d = duration;

        if((t>=d)) {
            return b+c;
        } else if ((t/=d) < (1/2.75)) {
            return c*(7.5625*t*t) + b;
        } else if (t < (2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
        } else if (t < (2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
        } else {
            return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
        }
    }

    function easeOutCubic(duration, time) {
        var t = time;
        var b = 0;
        var c = 1;
        var d = duration;

        return (t<=0) ? b : (t>=d) ? b+c : c*((t=t/d-1)*t*t + 1) + b;
    }

    function finishLevel(scene) {
        if(!finished) {
            finished = true;

            scene.finishTime = scene.app.timeElapsed;
            scene.levelTime = scene.finishTime - scene.startTime;

            console.log('level time', scene.levelTime);
            console.log('pickups collected', scene.pickups, '/', scene.totalPickups);

            /**
             *  Push player into finished state
             */
            var player;
            // find player
            for(var i = 0; i < scene.entities.length; i++) {
                if(scene.entities[i].components.physics.body.tag === 'player') {
                    player = scene.entities[i];
                    break;
                }
            }
            
            player.components.fsm._fsm.triggerEvent('finish');



            /**
             *  display finish text
             */


            /** "SCOREBOARD" **/
            var scoreString = [
                'FINISH!',
                '',
                'TIME    ' + (scene.levelTime/1000).toFixed(1),
                'PICKUPS ' + scene.pickups + '/' + scene.totalPickups
            ].join('\n');

            // The following code draws the "text" in figLayout
            var textEntities = createBlockText(scoreString);
            
            var textPos = {
                x: player.transform.position.x - 80,
                y: player.transform.position.y + 120
            };
            
            textEntities.forEach(function(ent) {
                scene.attachEntity(ent);
                setupTextBlockBehavior(ent, textPos);
            });
            
            setTimeout(function() {
                textEntities.forEach(function(ent) {
                    ent.destroy();

                });

                if(scene.app.currentLevelIndex >= scene.app.levelIds.length - 1) {
                    textEntities = createBlockText('YOU BEAT\nTHE GAME!');
                } else {
                    textEntities = createBlockText('PRESS KEY\nTO CONTINUE');
                }

                textEntities.forEach(function(ent) {
                    scene.attachEntity(ent);
                    setupTextBlockBehavior(ent, textPos);
                });
            }, 2000);
        }
    }

    function setupTextBlockBehavior(ent, pos) {
        pos = pos || { x:0, y:0 };
        ent._startTime = !!ent.scene.app ? ent.scene.app.timeElapsed : 0;
        ent._from = { x: pos.x, y: pos.y + 100*(2-1*Math.random()) };
        ent._to = { x: ent.transform.position.x + pos.x, y: ent.transform.position.y + pos.y };

        ent.script = function(ent) {
            var time = ent.scene.app.timeElapsed - ent._startTime;
            ent.transform.position.x = ent._to.x*easeOutElastic(2000, time) + ent._from.x*(1-easeOutElastic(2000, time));
            ent.transform.position.y = ent._to.y*easeOutElastic(500, time) + ent._from.y*(1-easeOutElastic(500, time));
        };
    }

    function createCharacterLayout(n) {
        n = n.toString();

        var characterLayout = [
            [1, 1, 0],
            [0, 0, 1],
            [0, 1, 0],
            [0, 0, 0],
            [0, 1, 0],
        ];
        switch(n) {
            // SPECIAL CHARACTERS
            case '.':
                characterLayout = [
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 1, 0]];
                break;
            case ' ':
                characterLayout = [
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0]];
                break;
            case '/':
                characterLayout = [
                    [0, 0, 1],
                    [0, 0, 1],
                    [0, 1, 0],
                    [1, 0, 0],
                    [1, 0, 0]];
                break;
            case '!':
                characterLayout = [
                    [0, 1, 0],
                    [0, 1, 0],
                    [0, 1, 0],
                    [0, 0, 0],
                    [0, 1, 0]];
                break;
            case '?':
                // Default thing is a question mark
                break;

            // NUMBERS
            case '0':
                characterLayout = [
                    [0, 1, 0],
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 0, 1],
                    [0, 1, 0]];
                break;
            case '1':
                characterLayout = [
                    [0, 1, 0],
                    [1, 1, 0],
                    [0, 1, 0],
                    [0, 1, 0],
                    [1, 1, 1]];
                break;
            case '2':
                characterLayout = [
                    [1, 1, 0],
                    [0, 0, 1],
                    [0, 1, 0],
                    [1, 0, 0],
                    [1, 1, 1]];
                break;
            case '3':
                characterLayout = [
                    [1, 1, 0],
                    [0, 0, 1],
                    [0, 1, 0],
                    [0, 0, 1],
                    [1, 1, 0]];
                break;
            case '4':
                characterLayout = [
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 1, 1],
                    [0, 0, 1],
                    [0, 0, 1]];
                break;
            case '5':
                characterLayout = [
                    [1, 1, 1],
                    [1, 0, 0],
                    [1, 1, 0],
                    [0, 0, 1],
                    [1, 1, 0]];
                break;
            case '6':
                characterLayout = [
                    [0, 1, 1],
                    [1, 0, 0],
                    [1, 1, 0],
                    [1, 0, 1],
                    [0, 1, 0]];
                break;
            case '7':
                characterLayout = [
                    [1, 1, 1],
                    [0, 0, 1],
                    [0, 1, 0],
                    [0, 1, 0],
                    [0, 1, 0]];
                break;
            case '8':
                characterLayout = [
                    [0, 1, 0],
                    [1, 0, 1],
                    [0, 1, 0],
                    [1, 0, 1],
                    [0, 1, 0]];
                break;
            case '9':
                characterLayout = [
                    [0, 1, 0],
                    [1, 0, 1],
                    [0, 1, 1],
                    [0, 0, 1],
                    [1, 1, 0]];
                break;

            // ALPHABET
            case 'a':
                characterLayout = [
                    [0, 1, 0],
                    [1, 0, 1],
                    [1, 1, 1],
                    [1, 0, 1],
                    [1, 0, 1]];
                break;
            case 'b':
                characterLayout = [
                    [1, 1, 0],
                    [1, 0, 1],
                    [1, 1, 0],
                    [1, 0, 1],
                    [1, 1, 0]];
                break;
            case 'c':
                characterLayout = [
                    [0, 1, 1],
                    [1, 0, 0],
                    [1, 0, 0],
                    [1, 0, 0],
                    [0, 1, 1]];
                break;
            case 'd':
                characterLayout = [
                    [1, 1, 0],
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 1, 0]];
                break;
            case 'e':
                characterLayout = [
                    [1, 1, 1],
                    [1, 0, 0],
                    [1, 1, 0],
                    [1, 0, 0],
                    [1, 1, 1]];
                break;
            case 'f':
                characterLayout = [
                    [1, 1, 1],
                    [1, 0, 0],
                    [1, 1, 0],
                    [1, 0, 0],
                    [1, 0, 0]];
                break;
            case 'g':
                characterLayout = [
                    [0, 1, 1],
                    [1, 0, 0],
                    [1, 1, 1],
                    [1, 0, 1],
                    [0, 1, 1]];
                break;
            case 'h':
                characterLayout = [
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 1, 1],
                    [1, 0, 1],
                    [1, 0, 1]];
                break;
            case 'i':
                characterLayout = [
                    [1, 1, 1],
                    [0, 1, 0],
                    [0, 1, 0],
                    [0, 1, 0],
                    [1, 1, 1]];
                break;
            case 'j':
                characterLayout = [
                    [1, 1, 1],
                    [0, 0, 1],
                    [0, 0, 1],
                    [1, 0, 1],
                    [1, 1, 1]];
                break;
            case 'k':
                characterLayout = [
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 1, 0],
                    [1, 0, 1],
                    [1, 0, 1]];
                break;
            case 'l':
                characterLayout = [
                    [1, 0, 0],
                    [1, 0, 0],
                    [1, 0, 0],
                    [1, 0, 0],
                    [1, 1, 1]];
                break;
            case 'm':
                characterLayout = [
                    [1, 0, 1],
                    [1, 1, 1],
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 0, 1]];
                break;
            case 'n':
                characterLayout = [
                    [1, 1, 0],
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 0, 1]];
                break;
            case 'o':
                characterLayout = [
                    [0, 1, 0],
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 0, 1],
                    [0, 1, 0]];
                break;
            case 'p':
                characterLayout = [
                    [1, 1, 0],
                    [1, 0, 1],
                    [1, 1, 0],
                    [1, 0, 0],
                    [1, 0, 0]];
                break;
            case 'r':
                characterLayout = [
                    [1, 1, 0],
                    [1, 0, 1],
                    [1, 1, 0],
                    [1, 0, 1],
                    [1, 0, 1]];
                break;
            case 's':
                characterLayout = [
                    [0, 1, 1],
                    [1, 0, 0],
                    [0, 1, 0],
                    [0, 0, 1],
                    [1, 1, 0]];
                break;
            case 't':
                characterLayout = [
                    [1, 1, 1],
                    [0, 1, 0],
                    [0, 1, 0],
                    [0, 1, 0],
                    [0, 1, 0]];
                break;
            case 'u':
                characterLayout = [
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 1, 1]];
                break;
            case 'v':
                characterLayout = [
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 0, 1],
                    [1, 0, 1],
                    [0, 1, 0]];
                break;
            case 'y':
                characterLayout = [
                    [1, 0, 1],
                    [1, 0, 1],
                    [0, 1, 0],
                    [0, 1, 0],
                    [0, 1, 0]];
                break;
        }

        return characterLayout;
    }

    function createStringLayout(n) {
        n = n.toString().toLowerCase();
        
        var characterLayout;
        var character;
        var numberLayout = [[],[],[],[],[]];
        var line = 0;
        var charHeight = 5;
        for(var i = 0; i < n.length; i++) {
            character = n.substr(i,1);
            
            if(character === '\n') {
                numberLayout = numberLayout.concat([[],[],[],[],[],[]]);
                line++;
                continue;
            }
            
            characterLayout = createCharacterLayout(character);
            for(var j = 0; j < characterLayout.length; j++) {
                numberLayout[line + line*charHeight + j] = numberLayout[line + line*charHeight + j].concat(characterLayout[j].concat([0]));
            }
        }
        
        return numberLayout;
    }


    function createBlockText(string, size) {
        size = size || 5;
        var figLayout = createStringLayout(string);
        var entities = [];
        var ent;

        for(var r = 0; r < figLayout.length; r++) {
                for(var c = 0; c < figLayout[r].length; c++) {
                    if(figLayout[r][c]) {

                        ent = new Entity();

                        ent.transform.position.x = size*c;
                        ent.transform.position.y = -size*r;

                        var rand = Math.random();
                        ent.components.graphics = new Graphics3DComponent({
                            scale: [size, size, size],
                            color: [rand, 1-rand, Math.random(), 1]
                        });

                        entities.push(ent);
                    }
                }
            }

        return entities;
    }

    function PlatformGameFactory() {}

    PlatformGameFactory.createFinishEffect = function(scene /*, options*/ ) {
        var finishText = new Entity();
        scene.attachEntity(finishText);

        finishText.components.graphics = new GraphicsSpriteComponent({
            imagePath: 'image/finish.png',
            width: 512,
            height: 128
        });

        return finishText;
    };

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
                collisionVector.y > 0) {
                // Landed, so don't bounce!
                this.body.vel.y = 0;

                // Trigger grounded state
                playerEntity.components.fsm._fsm.triggerEvent('ground');
            }

            if(otherBody.tag === 'goal') {
                finishLevel(scene);
            }

            if(otherBody.tag === 'enemy') {
                if(!finished) {
                    playerEntity.components.fsm._fsm.triggerEvent('die');
                }
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

        var scaleJump = function(ent) {
            var yVel = -ent.components.physics.body.vel.y;
            var factor = 0.5;
            
            var squash = factor * yVel;
            squash = squash > 1 ? 1 : squash;
            squash = squash < -0.8 ? -0.8 : squash;

            if(!ent.components.graphics.graphic._scale) {
                ent.components.graphics.graphic._scale = [
                    ent.components.graphics.graphic.scale[0],
                    ent.components.graphics.graphic.scale[1]
                ];
            }

            ent.components.graphics.graphic.scale[0] = ent.components.graphics.graphic._scale[0] * (1 - squash);
            ent.components.graphics.graphic.scale[1] = ent.components.graphics.graphic._scale[1] * (1 + squash);
        };

        // Configure FSM
        fsm.createState('grounded')
            .onEnter(function(ent) {
                ent.script = function() {
                    sideMove(ent);
                    scaleJump(ent);

                    if(ent.components.input.keys[options.keys.jump]) {
                        // Add jumping force
                        ent.components.physics.body.applyForce({
                            x: 0,
                            y: 0.1
                        });

                        // Trigger jump event
                        fsm._fsm.triggerEvent('jump');
                    }

                };

                // Super ugly way of doing this...better though a bus or something
                playerEntity.scene._groundedHappened = true;

                // Make the light flicker
                ent.scene._lightManager.flicker(ent.scene.app.timeElapsed - 500);
            })
            .addTransition('jump', 'jumping')
            .addTransition('die', 'dead')
            .addTransition('finish', 'finished');

        fsm.createState('jumping')
            .onEnter(function(ent) {
                ent.script = function() {
                    sideMove(ent);
                    scaleJump(ent);
                };
            })
            .addTransition('ground', 'grounded')
            .addTransition('die', 'dead')
            .addTransition('finish', 'finished');

        fsm.createState('dead')
            .onEnter(function(ent) {
                var timeEnteredState = ent.scene.app.timeElapsed;
                var timeUntilInputAccepted = 1000;
                var dieTime = 2000;
                
                // TODO: It's dumb to need to do this.
                // Camera and player is something that should be easily accessible.
                // Having a function to find an entity in the scene could be a good idea though.
                var camEnt;
                for(var i = 0; i < scene.entities.length; i++) {
                    if(!!scene.entities[i].components.camera) {
                        camEnt = scene.entities[i];
                        console.log('found it!');
                        break;
                    }
                }

                ent.script = function(ent) {
                    scaleJump(ent);

                    // Slow down to stop ...
                    ent.components.physics.body.vel.x *= 0.8;

                    if(!ent.startTime) ent.startTime = ent.scene.app.timeElapsed;

                    var dt = ent.scene.app.timeElapsed - ent.startTime;

                    var shakeScale = 10*(1-easeOutCubic(2*dieTime, dt));
                    camEnt.transform.position.x = camEnt.transform.position.x + shakeScale*Math.cos(ent.scene.app.timeElapsed/50);
                    camEnt.transform.position.y = camEnt.transform.position.y + shakeScale*Math.sin(ent.scene.app.timeElapsed/70);

                    var f = 1 - easeOutBounce(0.5*dieTime, dt);
                    if(f === 1) return;
                    ent.components.graphics.graphic.scale[0] *= f;
                    ent.components.graphics.graphic.scale[1] *= f;
                    
                    if(ent.components.input.keys[options.keys.left] ||
                        ent.components.input.keys[options.keys.right] ||
                        ent.components.input.keys[options.keys.jump]) {
                        if(ent.scene.app.timeElapsed > (timeEnteredState + timeUntilInputAccepted)) {
                            scene.app.playerDied();
                            finished = false;
                        }
                    }
                };

                var textEntities = createBlockText('YOU DIED\n\nLIVES  ' + (scene.app.lives-1));

                textEntities.forEach(function(tEnt) {
                    ent.scene.attachEntity(tEnt);
                    setupTextBlockBehavior(tEnt, {
                        x: ent.transform.position.x - 90,
                        y: ent.transform.position.y + 80
                    });
                });

            });

        fsm.createState('finished')
            .onEnter(function(ent) {
                console.log('FINISH STATE');
                var timeEnteredState = ent.scene.app.timeElapsed;
                var timeUntilInputAccepted = 2000;
                delete ent.components.physics;

                ent.script = function(ent) {

                    if(!ent.startTime) ent.startTime = ent.scene.app.timeElapsed;

                    var dt = ent.scene.app.timeElapsed - ent.startTime;

                    var shakeScale = 20*easeOutCubic(0.25*timeUntilInputAccepted, dt);
                    ent.components.graphics.graphic.scale[0] = ent.components.graphics.graphic.scale[0] + shakeScale*Math.cos(ent.scene.app.timeElapsed/50);
                    ent.components.graphics.graphic.scale[1] = ent.components.graphics.graphic.scale[1] + shakeScale*Math.sin(ent.scene.app.timeElapsed/70);

                    var f = 1 - easeOutCubic(0.5*timeUntilInputAccepted, dt - 250);
                    if(f === 1) return;
                    ent.components.graphics.graphic.scale[0] *= f;
                    ent.components.graphics.graphic.scale[1] *= f;
                

                    if(ent.components.input.keys[options.keys.left] ||
                        ent.components.input.keys[options.keys.right] ||
                        ent.components.input.keys[options.keys.jump]) {
                        if(ent.scene.app.timeElapsed > (timeEnteredState + timeUntilInputAccepted)) {
                            scene.app.nextLevel();
                            finished = false;
                        }
                    }
                };


            });
        
        // Start in the jumping state
        fsm.enterState('jumping');

        var gfx3d = new Graphics3DComponent({
            scale: [options.width, options.height, options.width],
            color: [0,1,0,1]
        });
        playerEntity.addComponent(gfx3d);

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

        wall.components.graphics = new GraphicsSpriteComponent({
            imagePath: 'image/grass.png',
            width: options.width,
            height: options.height
        });

        var gfx3d = new Graphics3DComponent({
            scale: [options.width, options.height, options.width]
        });
        wall.addComponent(gfx3d);

        return wall;
    };

    PlatformGameFactory.createEnemy = function(scene, options) {
        options = options || {};

        options.tag = 'enemy';

        var enemy = this.createWall(scene, options);

        enemy.components.graphics = new GraphicsSpriteComponent({
            imagePath: 'image/zorp.png',
            width: options.width,
            height: options.height
        });

        var gfx3d = new Graphics3DComponent({
            scale: [options.width, options.height, options.width],
            color: [1,0,0,1]
        });
        enemy.addComponent(gfx3d);

        return enemy;
    };

    PlatformGameFactory.createGoal = function(scene, options) {
        options = options || {};

        options.tag = 'goal';

        var goal = this.createWall(scene, options);

        goal.components.graphics = new GraphicsSpriteComponent({
            imagePath: 'image/bullseye.png',
            width: options.width,
            height: options.height
        });

        goal.script = function(ent) {
            ent.components.graphics.graphic.color[1] = 0.7 + 0.3*Math.cos(2*Math.PI*ent.scene.app.timeElapsed/1000);
        };

        var gfx3d = new Graphics3DComponent({
            scale: [options.width, options.height, options.width],
            color: [0,1,0,1]
        });
        goal.addComponent(gfx3d);

        return goal;
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

            var timeUntilDestroy = 1000 + 1500*Math.random();
            setTimeout(function() {
                frag.destroy();
            }, timeUntilDestroy);

            // var scale = 0.0001;
            pc.body.applyForce(options.f);

            frag.components.graphics = new GraphicsSpriteComponent({
                imagePath: 'image/gold-nest.png',
                width: options.width,
                height: options.height
            });

            frag.script = function(ent) {
                if(!ent._startTime) ent._startTime = ent.scene.app.timeElapsed;

                ent.components.graphics.graphic.color[0] = 0.7 + 0.3*Math.cos(3*2*Math.PI*ent.scene.app.timeElapsed/1000);
                ent.components.graphics.graphic.color[1] = 0.7 + 0.3*Math.cos(3*2*Math.PI*ent.scene.app.timeElapsed/1000);

                ent.components.graphics.graphic.scale[0] = options.width*(1-easeOutCubic(500, ent.scene.app.timeElapsed - ent._startTime - (timeUntilDestroy - 500)));
                ent.components.graphics.graphic.scale[1] = options.height*(1-easeOutCubic(500, ent.scene.app.timeElapsed - ent._startTime - (timeUntilDestroy - 500)));
                ent.components.graphics.graphic.scale[2] = options.width*(1-easeOutCubic(500, ent.scene.app.timeElapsed - ent._startTime - (timeUntilDestroy - 500)));
            };

            var gfx3d = new Graphics3DComponent({
                scale: [options.width, options.height, options.width],
                color: [1,1,0,1]
            });
            frag.addComponent(gfx3d);
        }

        var pickup = this.createWall(scene, options);

        pickup.components.graphics.graphic.color = [1, 1, 0, 1];
        pickup.components.physics.body.isSensor = true;
        pickup.components.physics.on('collision', function(otherBody, collisionVector) {
            if(otherBody.tag === 'player') {
                console.log('yo i am a pickup and i got picked up');

                scene.pickups += 1;

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

        pickup.components.graphics = new GraphicsSpriteComponent({
            imagePath: 'image/gold-nest.png',
            width: options.width,
            height: options.height
        });

        var gfx3d = new Graphics3DComponent({
            scale: [options.width, options.height, options.width],
            color: [1,1,0,1]
        });
        pickup.addComponent(gfx3d);

        pickup.script = function(ent) {
            ent.components.graphics.graphic.color[0] = 0.7 + 0.3*Math.cos(2*Math.PI*ent.scene.app.timeElapsed/1000);
            ent.components.graphics.graphic.color[1] = 0.7 + 0.3*Math.cos(2*Math.PI*ent.scene.app.timeElapsed/1000);
        };
                   
        scene.totalPickups += 1;

        return pickup;
    };

    PlatformGameFactory.createLevel = function(levelNumber, app) {
        if(!levelNumber) return;

        var level;
        switch(levelNumber) {
            case 1:
                level = this.createLevel1();
                break;

            case 2:
                level = this.createLevel2();
                break;

            case 3:
                level = this.createLevel3();
                break;
        }

        level.startTime = app.timeElapsed;
        level.pickups = 0;

        addLightManager(level);

        return level;
    };

    function addLightManager(scene) {
        var lightManager = new Entity();
        scene.attachEntity(lightManager);
        scene._lightManager = lightManager;
        lightManager._inputs = [];
        lightManager.flicker = function(time) {
            if(!time) return;

            lightManager._inputs.push(time);
        };
        lightManager.script = function(ent) {
            if(!ent._initialized) {
                ent._initialized = true;
                ent.flicker(ent.scene.app.timeElapsed);
            }

            var intensity = 20;
            var scale = 1;
            
            if(lightManager._inputs.length > 0) {
                lightManager._inputs.forEach(function(time) {
                    scale *= easeOutBounce(1000, ent.scene.app.timeElapsed - time);
                });
            }

            ent.scene._lightIntensity = intensity*scale*scale;
        };
    }

    PlatformGameFactory.createLevel1 = function() {

        /**
         * Create main scene
         */
        var scene = new Scene('main');
        scene.totalPickups = 0;

        // Create player
        var player = PlatformGameFactory.createPlayer(scene, {
            x: -200,
            y: 80,
            width: 50,
            height: 70,
            keys: {
                left: 'LEFT',
                right: 'RIGHT',
                jump: 'SPACE'
            }
        });

        // We want the camera to follow the player
        PlatformGameFactory.createCamera(scene, {
            follow: player
        });

        // Create a floor
        PlatformGameFactory.createWall(scene, {
            x: 0,
            y: 20,
            width: 2400,
            height: 20
        });

        // Create the little floor obstacle
        PlatformGameFactory.createWall(scene, {
            x: 30,
            y: 45,
            width: 30,
            height: 30
        });

        PlatformGameFactory.createPickup(scene, {
            x: 200,
            y: 180
        });

        // Create a goal
        PlatformGameFactory.createGoal(scene, {
            x: 500,
            y: 60,
            width: 30,
            height: 30
        });

        // TODO: Be able to set gravity!!!
        if(scene._physicsWorld) {
            console.log('set gravity');
            scene._physicsWorld.gravity = new Vec2(0, -0.005);
        }


        return scene;
    };

    PlatformGameFactory.createLevel2 = function() {

        /**
         * Create main scene
         */
        var scene = new Scene('main');
        scene.totalPickups = 0;

        // Create player
        var player = PlatformGameFactory.createPlayer(scene, {
            x: -200,
            y: 80,
            width: 50,
            height: 70,
            keys: {
                left: 'LEFT',
                right: 'RIGHT',
                jump: 'SPACE'
            }
        });

        // We want the camera to follow the player
        PlatformGameFactory.createCamera(scene, {
            follow: player
        });

        // Create a floor
        PlatformGameFactory.createWall(scene, {
            x: 0,
            y: 20,
            width: 2400,
            height: 20
        });

        // Create the little floor obstacle
        PlatformGameFactory.createWall(scene, {
            x: 30,
            y: 45,
            width: 30,
            height: 30
        });

        // Create the little floor obstacle
        PlatformGameFactory.createWall(scene, {
            x: 30,
            y: 85,
            width: 30,
            height: 30
        });

        // Create a goal
        PlatformGameFactory.createGoal(scene, {
            x: 500,
            y: 60,
            width: 30,
            height: 30
        });

        // TODO: Be able to set gravity!!!
        if(scene._physicsWorld) {
            console.log('set gravity');
            scene._physicsWorld.gravity = new Vec2(0, -0.005);
        }


        return scene;
    };

    PlatformGameFactory.createLevel3 = function() {

        /**
         * Create main scene
         */
        var scene = new Scene('main');
        scene.totalPickups = 0;

        // Create player
        var player = PlatformGameFactory.createPlayer(scene, {
            x: -200,
            y: 80,
            width: 50,
            height: 70,
            keys: {
                left: 'LEFT',
                right: 'RIGHT',
                jump: 'SPACE'
            }
        });

        // We want the camera to follow the player
        PlatformGameFactory.createCamera(scene, {
            follow: player
        });

        // Create a floor
        PlatformGameFactory.createWall(scene, {
            x: 0,
            y: 20,
            width: 2400,
            height: 20
        });

        // Create the little floor obstacle
        PlatformGameFactory.createWall(scene, {
            x: 30,
            y: 45,
            width: 30,
            height: 30
        });

        // Create the little floor obstacle
        PlatformGameFactory.createWall(scene, {
            x: 200,
            y: 120,
            width: 30,
            height: 30
        });

        // Create the little floor obstacle
        PlatformGameFactory.createWall(scene, {
            x: 350,
            y: 180,
            width: 30,
            height: 30
        });

        // Create a goal
        PlatformGameFactory.createGoal(scene, {
            x: 500,
            y: 300,
            width: 30,
            height: 30
        });

        // Create an enemy
        PlatformGameFactory.createEnemy(scene, {
            x: 500,
            y: 60,
            width: 600,
            height: 30
        });

        PlatformGameFactory.createPickup(scene, {
            x: 390,
            y: 250
        });

        // TODO: Be able to set gravity!!!
        if(scene._physicsWorld) {
            console.log('set gravity');
            scene._physicsWorld.gravity = new Vec2(0, -0.005);
        }


        return scene;
    };

    PlatformGameFactory.createMenu = function() {

        /**
         * Create menu scene
         */
        var scene = new Scene('menu');

        var textEntities = createBlockText('JUMP\nDUDE', 15);

        textEntities.forEach(function(ent) {
            scene.attachEntity(ent);
            setupTextBlockBehavior(ent, {
                x: -100,
                y: 120
            });
        });

        function loadLevel1() {
            console.log('kddd');
            scene.app.loadLevel(1);
            window.removeEventListener('keydown', loadLevel1);
        }
        var whatevs = textEntities[0].script;
        textEntities[0].script = function(ent) {
            whatevs(ent);

            window.addEventListener('keydown', loadLevel1);
        };

        addLightManager(scene);

        scene.onEnter = function() {
            scene._lightManager.flicker(scene.app.timeElapsed);
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

        camera.startTime = 0;
        camera.script = function(ent) {
            // YOLO: ent.components.camera.follow is totally ducktyped
            ent.transform.position.x += 0.1 * (ent.components.camera.follow.transform.position.x - ent.transform.position.x);
            ent.transform.position.y += 0.1 * (ent.components.camera.follow.transform.position.y - ent.transform.position.y);



            var duration = 500;
            
            if(!!ent.scene._groundedHappened) {
                ent.scene._groundedHappened = false;
                ent.startTime = ent.scene.app.timeElapsed;
            } else {
                var dt = ent.scene.app.timeElapsed - ent.startTime;
                var f = 1 - easeOutCubic(duration, dt);

                ent.transform.position.x += 5 * f * Math.sin(ent.scene.app.timeElapsed);
                ent.transform.position.y += 15 * f * Math.sin(0.3*ent.scene.app.timeElapsed);

            }
        };

        return camera;
    };

    return PlatformGameFactory;
});