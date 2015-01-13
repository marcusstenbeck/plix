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
    'plix/PlixApp',
    'lib/vendor/physix/src/Body',
    'lib/vendor/physix/src/Vec2'
], function(
    PlixApp,
    Body,
    Vec2
){
    var game = new PlixApp();
    game.DEBUG = true;

    var init = function() {

        /**
         * Create main scene
         */
        var s = game.createScene('main');
        
        var e;  // temp storage for an entity

        // Top wall
        e = s.createEntity();
        e.transform.position.x = game.width/2;
        e.transform.position.y = -10;
        e.size.x = game.width;
        e.size.y = 20;
        e.component('physics').body.type = Body.KINEMATIC;

        // Bottom wall
        e = s.createEntity();
        e.transform.position.x = game.width/2;
        e.transform.position.y = game.height + 10;
        e.size.x = game.width;
        e.size.y = 20;
        e.component('physics').body.type = Body.KINEMATIC;

        // Left wall
        e = s.createEntity();
        e.transform.position.x = - 9;
        e.transform.position.y = game.height/2;
        e.size.x = 20;
        e.size.y = game.height;
        e.component('physics').body.type = Body.KINEMATIC;

        // Right wall
        e = s.createEntity();
        e.transform.position.x = game.width + 10;
        e.transform.position.y = game.height/2;
        e.size.x = 20;
        e.size.y = game.height;
        e.component('physics').body.type = Body.KINEMATIC;

        // Create paddle 1
        e = s.createEntity();
        e.transform.position.x = 100;
        e.transform.position.y = game.height - 50;
        e.size.x = 100;
        e.size.y = 10;
        
        e.component('physics').body.type = Body.KINEMATIC;

        e.component('fsm')
            .createState('default')
            .onEnter(function(ent) {
                var game = ent.scene.app;

                ent.script = function() {
                    var xVel = 0;
                    xVel += game.input.keyboard.A ? -0.5 : 0;
                    xVel += game.input.keyboard.S ? 0.5 : 0;
                    ent._components.physics.body.vel.x = xVel;
                };
            });
        // TODO: It's dumb to have to require this if we only add one state...
        e.component('fsm').enterState('default');


        // Create paddle 2
        e = s.createEntity();
        e.transform.position.x = 100;
        e.transform.position.y = 50;
        e.size.x = 100;
        e.size.y = 10;

        e.component('physics').body.type = Body.KINEMATIC;

        e.component('fsm')
            .createState('default')
            .onEnter(function(ent) {
                var game = ent.scene.app;

                ent.script = function() {
                    var xVel = 0;
                    xVel += game.input.keyboard.K ? -0.5 : 0;
                    xVel += game.input.keyboard.L ? 0.5 : 0;
                    ent._components.physics.body.vel.x = xVel;
                };
            });
        // TODO: It's dumb to have to require this if we only add one state...
        e.component('fsm').enterState('default');

        // Create ball
        e = s.createEntity();
        e.size.x = 10;
        e.size.y = 10;
        e.transform.position.x = game.width/2 - e.size.x/2;
        e.transform.position.y = game.height/2 - e.size.y/2;

        e.component('fsm')
            .createState('default')
            .onEnter(function(ent) {
                var game = ent.scene.app;

                ent.script = function() {
                    // stuff ...
                };
            });
        // TODO: It's dumb to have to require this if we only add one state...
        e.component('fsm').enterState('default');


        e.component('physics').body.applyForce(new Vec2(0.001, 0.01));

        /**
         * Run game
         */
        game.start();
    };

    init();
});