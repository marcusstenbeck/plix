requirejs.config({
    // Default loading base url
    baseUrl: '',
    //except, if the module ID starts with "app",
    //load it from the ./examples directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        lib: '../../lib',
        plix: '../../../src/plix'
    }
});
define([
    'plix/PlixApp',
    'js/PongFactory',
    'lib/vendor/physix/src/Vec2'
], function(
    PlixApp,
    PongFactory,
    Vec2
) {
    'use strict';

    var game = new PlixApp();

    var init = function() {

        /**
         * Create main scene
         */
        var scene = game.createScene('main');


        /**
         *  Walls
         */

        // Top wall
        PongFactory.createWall(scene, {
            x: game.width/2,
            y: -10,
            width: game.width,
            height: 20
        });

        // Bottom wall
        PongFactory.createWall(scene, {
            x: game.width/2,
            y: game.height + 10,
            width: game.width,
            height: 20
        });

        // Left wall
        PongFactory.createWall(scene, {
            x: -9,
            y: game.height/2,
            width: 20,
            height: game.height
        });

        // Right wall
        PongFactory.createWall(scene, {
            x: game.width + 10,
            y: game.height/2,
            width: 20,
            height: game.height
        });


        /**
         *  Paddles
         */

        // Create paddle 1
        PongFactory.createPaddle(scene, {
            x: 100,
            y: game.height - 50,
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
            x: game.width/2,
            y: game.height/2,
            width: 10,
            height: 10
        });
        ball.components.physics.body.applyForce(new Vec2(0.001, 0.01));


        /**
         * Run game
         */
        game.start();
    };

    init();
});