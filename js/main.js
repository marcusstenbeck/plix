requirejs.config({
    // Default loading base url
    baseUrl: './',
    //except, if the module ID starts with "app",
    //load it from the ./examples directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        lib: './weiiii/lib',
        plix: './src/plix'
    }
});
define([
    'plix/PlixApp',
    'js/PlatformGameFactory'
], function(
    PlixApp,
    PlatformGameFactory
) {
    'use strict';

    // Create an app. It's idle until told to run.
    var app = new PlixApp();

    app.levelIds = [1, 2, 3];
    app.currentLevelIndex = 0;
    app.lives = 3;

    app.resetGame = function() {
        app.currentLevelIndex = 0;
        app.lives = 3;
    };

    app.nextLevel = function nextLevel() {
        app.popScene();

        app.currentLevelIndex++;
        
        if(app.currentLevelIndex >= app.levelIds.length) {
            console.log('No more levels. Do not try to push level scene onto stack.');
            app.resetGame();
            return;
        }

        app.loadLevel(app.levelIds[app.currentLevelIndex]);
    };

    app.loadLevel = function(levelId) {
        
        var level = PlatformGameFactory.createLevel(levelId, app);
        
        if(!level) {
            console.log('Cannot create level with id:', levelId);
            return;
        }

        app.pushScene(level);
    };

    app.playerDied = function playerDied() {
        app.popScene();

        console.log('Lives left:', --app.lives);

        if(app.lives > 0) {
            app.loadLevel(app.levelIds[app.currentLevelIndex]);
        } else {
            app.resetGame();
        }
    };

    // Create main menu scene
    var menu = PlatformGameFactory.createMenu(app);

    // Run the app with main menu scene
    app.runWithScene(menu);
});