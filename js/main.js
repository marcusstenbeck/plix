define([
    'plix/Scene',
    'Creator',
    'plix/Runner'
], function(
    Scene,
    Creator,
    Runner
){
    var game = new Runner();

    var init = function() {
        game.canvas.width = 720;
        game.canvas.height = 405;

        // Create player entity
        var player = Creator.createEntity({
            type: 'player',
            position: {
                x: game.scene.width/2,
                y: game.scene.height/2
            },
            scene: game.scene
        });
        // Add entity to scene
        game.scene.entities.push(player);



        // Create enemy entity
        var enemy = Creator.createEntity({
            type: 'enemy',
            position: {
                x: game.scene.width/2 + game.scene.width/2 * (Math.random() * 2 - 1),
                y: game.scene.height/2+ game.scene.height/2 * (Math.random() * 2 - 1)
            },
            scene: game.scene
        });
        // Add enemy entity to scene
        game.scene.entities.push(enemy);
        
        game.start();
    };

    init();
});