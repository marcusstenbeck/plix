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
         * Create fireworks
         */
        var s = game.createScene('main');
        
        // TODO:
        // I want to be able to create an
        // entity with a parameter object

        // Create paddle 1
        var e = s.createEntity();
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
                    if(game.input.keyboard.A) ent._components.physics.body.pos.x -= 5;
                    if(game.input.keyboard.S) ent._components.physics.body.pos.x += 5;

                    var halfWidth = ent.size.x/2;
                    var leftEdge = ent._components.physics.body.pos.x + halfWidth;
                    var rightEdge = ent._components.physics.body.pos.x - halfWidth;
                    if(leftEdge >= game.width) ent._components.physics.body.pos.x = game.width - halfWidth;
                    if(rightEdge <= 0) ent._components.physics.body.pos.x = halfWidth;
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
                    if(game.input.keyboard.K) ent._components.physics.body.pos.x -= 5;
                    if(game.input.keyboard.L) ent._components.physics.body.pos.x += 5;

                    var halfWidth = ent.size.x/2;
                    var leftEdge = ent._components.physics.body.pos.x + halfWidth;
                    var rightEdge = ent._components.physics.body.pos.x - halfWidth;
                    if(leftEdge >= game.width) ent._components.physics.body.pos.x = game.width - halfWidth;
                    if(rightEdge <= 0) ent._components.physics.body.pos.x = halfWidth;
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