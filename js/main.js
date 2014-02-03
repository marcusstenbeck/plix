define([
    'plix/PlixApp',
    'plix/FsmComponent'
], function(
    PlixApp,
    FsmComponent
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
        
        e.component('fsm')
            .createState('default')
            .onEnter(function(ent) {
                var game = ent.scene.app;

                ent.script = function() {
                    if(game.input.keyboard.A) ent.transform.position.x -= 5;
                    if(game.input.keyboard.S) ent.transform.position.x += 5;

                    var halfWidth = ent.size.x/2;
                    var leftEdge = ent.transform.position.x + halfWidth;
                    var rightEdge = ent.transform.position.x - halfWidth;
                    if(leftEdge >= game.width) ent.transform.position.x = game.width - halfWidth;
                    if(rightEdge <= 0) ent.transform.position.x = halfWidth;
                };
            });
        e.component('fsm').enterState('default');

        // Create paddle 2
        e = s.createEntity();
        e.transform.position.x = 100;
        e.transform.position.y = 50;
        e.size.x = 100;
        e.size.y = 10;

        e.component('fsm')
            .createState('default')
            .onEnter(function(ent) {
                var game = ent.scene.app;

                ent.script = function() {
                    if(game.input.keyboard.K) ent.transform.position.x -= 5;
                    if(game.input.keyboard.L) ent.transform.position.x += 5;

                    var halfWidth = ent.size.x/2;
                    var leftEdge = ent.transform.position.x + halfWidth;
                    var rightEdge = ent.transform.position.x - halfWidth;
                    if(leftEdge >= game.width) ent.transform.position.x = game.width - halfWidth;
                    if(rightEdge <= 0) ent.transform.position.x = halfWidth;
                };
            });
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
                    // if(collide) ent.transform.position.x += 1;
                    ent.transform.position.x += 1;

                    // "Ball" is symmetric
                    var halfSize = ent.size.x/2;

                    var left = ent.transform.position.x + halfSize;
                    var right = ent.transform.position.x - halfSize;
                    var top = ent.transform.position.y + halfSize;
                    var bottom = ent.transform.position.y - halfSize;

                    if(left >= game.width) ent.transform.position.x = game.width - halfSize;
                    if(right <= 0) ent.transform.position.x = halfSize;
                };
            });
        e.component('fsm').enterState('default');


        /**
         * Run game
         */
        game.start();
    };

    init();
});