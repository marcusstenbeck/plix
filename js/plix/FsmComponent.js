define([
    'plix/Component',
    '../../node_modules/fsm/amd/FSM'
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