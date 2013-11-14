define([
    'Entity',
    'Creator',
    'Util'
], function(
    Entity,
    Creator,
    Util
){
    (function() {
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame =
                window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());





    var canvas = document.getElementById('game');
    var ctx = canvas.getContext('2d');

    var world;
    var physicsWorld;

    var init = function() {

        canvas.width = 720;
        canvas.height = 405;

        // Don't use this unless it's full screen
        /*
        window.onresize = function() {
            canvas.width = document.width;
            canvas.height = document.height;
        };
        */

        world = {
            width: canvas.width,
            height: canvas.height,
            entities: [],
            getEntityByType: function(type) {
                for(var i = 0; i < this.entities.length; i++) {
                    if(this.entities[i].type == type) return this.entities[i];
                }
                return null;
            },
            mouse: {
                x: 125,
                y: 20
            },
            time: 0,
            tpf: 0
        };


        var player = Creator.createEntity({
            type: 'player',
            position: {
                x: canvas.width/2,
                y: canvas.height/2
            },
            world: world
        });
        world.entities.push(player);

        var enemy = Creator.createEntity({
            type: 'enemy',
            position: {
                x: canvas.width/2 + canvas.width/2 * (Math.random() * 2 - 1),
                y: canvas.height/2+ canvas.height/2 * (Math.random() * 2 - 1)
            },
            world: world
        });
        world.entities.push(enemy);


        // Track mouse position
        canvas.addEventListener('mousemove', function(e) {
            world.mouse.x = e.offsetX;
            world.mouse.y = e.offsetY;
        });

        world.input = {
            mouse: {},
            keyboard: {}
        };

        // Listen to keydown
        document.addEventListener('keydown', function(e) {

            var key = false;

            switch(e.keyCode) {
                case 37:
                    key = 'LEFT';
                    break;
                case 65:
                    key = 'A';
                    break;
                case 38:
                    key = 'UP';
                    break;
                case 39:
                    key = 'RIGHT';
                    break;
                case 68:
                    key = 'D';
                    break;
                case 40:
                    key = 'DOWN';
                    break;
                case 32:
                    key = 'SPACE';
                    break;
                case 87:
                    key = 'W';
                    break;
                case 83:
                    key = 'S';
                    break;
                default:
                    console.warn('Uncaught key code', e.keyCode);
            }

            if(key) world.input.keyboard[key] = true;
        });

        // Listen to keyup
        document.addEventListener('keyup', function(e) {

            var key = false;

            switch(e.keyCode) {
                case 37:
                    key = 'LEFT';
                    break;
                case 65:
                    key = 'A';
                    break;
                case 38:
                    key = 'UP';
                    break;
                case 39:
                    key = 'RIGHT';
                    break;
                case 68:
                    key = 'D';
                    break;
                case 40:
                    key = 'DOWN';
                    break;
                case 32:
                    key = 'SPACE';
                    break;
                case 87:
                    key = 'W';
                    break;
                case 83:
                    key = 'S';
                    break;
                default:
                    console.warn('Uncaught key code', e.keyCode);
            }

            if(key) world.input.keyboard[key] = false;
        });
    }



    var game = {
        state: 'ready',
        tiles: 0,
        start: function() {
            // If game is already running, then return
            if(game.state == 'running') return;

            init();
            game.state = 'running';
            window.requestAnimationFrame(game.update);
        },
        update: function(time) {
            world.tpf = time - world.time;
            world.time = time;


            window.requestAnimationFrame(game.update);

            // Wipe the canvas clean
            ctx.clearRect(0, 0, world.width, world.height);
            ctx.fillStyle = 'rgba(0,0,0,1)';
            ctx.fillRect(0, 0, world.width, world.height);

            if(game.state == 'running') {
                for(var i = 0; i < world.entities.length; i++) {
                    var entity = world.entities[i];

                    // ScriptComponent
                    var scriptComponent = entity.components.scriptComponent;
                    scriptComponent.run(world.tpf);



                    // PhysicsComponent
                    var physicsComponent = entity.components.physicsComponent;

                    if(physicsComponent) {
                        // Increment physics
                        physicsComponent.body.position.x += physicsComponent.body.velocity.x;
                        physicsComponent.body.position.y += physicsComponent.body.velocity.y;

                        // Copy the position to the entity
                        entity.position = physicsComponent.body.position;
                    }





                    // GraphicsComponent
                    var graphicsComponent = entity.components.graphicsComponent;

                    var graphicType = graphicsComponent.graphic.type;
                    if(graphicType == 'shape') {
                        ctx.fillStyle = 'rgba(' +
                            graphicsComponent.graphic.color[0] * 255 + ', ' +
                            graphicsComponent.graphic.color[1] * 255 + ', ' +
                            graphicsComponent.graphic.color[2] * 255 + ', ' +
                            graphicsComponent.graphic.color[3] * 255 + ')';

                        // Entity position is centroid
                        ctx.fillRect(
                            parseInt(entity.position.x - graphicsComponent.graphic.shapeData.width / 2),
                            parseInt(entity.position.y - graphicsComponent.graphic.shapeData.height / 2),
                            graphicsComponent.graphic.shapeData.width,
                            graphicsComponent.graphic.shapeData.height);
                    } else if(graphicType == 'sprite') {

                        // Entity position is centroid
                        ctx.drawImage(
                            graphicsComponent.graphic.spriteData,
                            parseInt(entity.position.x - graphicsComponent.graphic.spriteData.width / 2),
                            parseInt(entity.position.y - graphicsComponent.graphic.spriteData.height / 2)
                        );
                    }
                }
            }
        },
        end: function() {
            game.state = 'lose';
        }
    };

    game.start();
});