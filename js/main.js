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
        var e = s.createEntity();
        e.transform.position.x = 100;
        e.transform.position.y = 100;
        e.size.x = 10;
        e.size.y = 10;
        e.setComponent(new FsmComponent());
        e.components.fsm.createState('flying')
            .onEnter(function(ent) {
                ent.script = function() {
                    ent.transform.position.x += 1;
                };
            });
        e.components.fsm.enterState('flying');


        /**
         * Run game
         */
        game.start();
    };

    init();
});