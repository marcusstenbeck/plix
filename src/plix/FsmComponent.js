requirejs.config({
    //By default load any module IDs from ../../src
//    baseUrl: '../../src',
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
    'plix/Component',
    'lib/vendor/fsm/src/FSM'
], function(
    Component,
    FSM
) {

    function FsmComponent(params) {
        if(!params) params = {};
        this.type = 'fsm';

        // The state machine
        this._fsm = params.fsm || new FSM({owner: this.entity});
    }
    FsmComponent.prototype = Object.create(Component.prototype);

    FsmComponent.prototype.createState = function(stateName) {
        return this._fsm.createState(stateName);
    };

    FsmComponent.prototype.enterState = function(stateName) {
        // TODO: If currently in a state, then run it's onExit
        this._fsm.enterState(stateName);
        return this;
    };

    FsmComponent.prototype.setEntity = function(entity) {
        this.entity = entity;
        this._fsm.owner = this.entity;
    };

    return FsmComponent;
});