define([
    'Entity',
    'Creator',
    'Util'
], function(
    Entity,
    Creator,
    Util
){
    var canvas = document.getElementById('game');
    var ctx = canvas.getContext('2d');

    var world;
    var physicsWorld;

    var init = function() {

        canvas.width = document.width;
        canvas.height = document.height;


        world = {
            width: document.width,
            height: document.height,
            entities: [],
            mouse: {
                x: 125,
                y: 20
            }
        };


        var player = Creator.createEntity({
            type: 'player',
            position: {
                x: 160,
                y: 160
            },
            size: {
                x: 16,
                y: 16
            },
            world: world
        });

        var obstacle = Creator.createEntity({
            type: 'obstacle',
            position: {
                x: 64,
                y: 128
            },
            size: {
                x: 32,
                y: 32
            },
            world: world
        });

        var obstacle2 = Creator.createEntity({
            type: 'obstacle',
            position: {
                x: 128,
                y: 64
            },
            size: {
                x: 32,
                y: 32
            },
            world: world
        });

        var obstacle3 = Creator.createEntity({
            type: 'obstacle',
            position: {
                x: 256,
                y: 256
            },
            size: {
                x: 32,
                y: 32
            },
            world: world
        });

        // Add box1 and box2 to game entities array
        world.entities.push(obstacle);
        world.entities.push(obstacle2);
        world.entities.push(obstacle3);
        world.entities.push(player);


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
                case 38:
                    key = 'UP';
                    break;
                case 39:
                    key = 'RIGHT';
                    break;
                case 40:
                    key = 'DOWN';
                    break;
                case 32:
                    key = 'SPACE';
                    break;
                default:
                    console.warn('No binding for key code', e.keyCode);
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
                case 38:
                    key = 'UP';
                    break;
                case 39:
                    key = 'RIGHT';
                    break;
                case 40:
                    key = 'DOWN';
                    break;
                case 32:
                    key = 'SPACE';
                    break;
                default:
                    console.warn('No binding for key code', e.keyCode);
            }

            if(key) world.input.keyboard[key] = false;
        });
    }






    var game = {
        status: null,
        state: 'ready',
        tiles: 0,
        start: function() {
            // If game is already running, then return
            if(game.state == 'running') return;

            init();
            game.state = 'running';
            game.status = window.setInterval(game.update, 1);
        },
        update: function() {
            ctx.clearRect(0, 0, world.width, world.height);

            if(game.state == 'running') {
                for(var i = 0; i < world.entities.length; i++) {

                    // Remove previous intersects
                    world.entities[i].intersect = [];

                    // Check for intersections
                    for(var j = 0; j < world.entities.length; j++) {
                        if(i != j && Util.intersectRect(world.entities[i], world.entities[j])) {
                            world.entities[i].intersect.push(world.entities[j]);
                        }
                    }

                    if(world.entities[i].update) world.entities[i].update();
                    if(world.entities[i].draw) world.entities[i].draw(ctx);
                }
            }



        },
        end: function() {
            game.state = 'lose';
        }
    };

    game.start();
});