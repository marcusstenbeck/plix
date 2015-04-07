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
    'js/PlatformGameFactory'
], function(
    PlixApp,
    PlatformGameFactory
) {
    'use strict';

    // Create an app. It's idle until told to run.
    var app = new PlixApp();

    // Create main menu scene
    var menu = PlatformGameFactory.createMenu(app);

    // Run the app with main menu scene
    app.runWithScene(menu);
});