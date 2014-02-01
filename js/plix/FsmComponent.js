define([
    'plix/Component',
    '../../node_modules/fsm/amd/FSM'
], function(
    Component,
    FSM
) {

    function FsmComponent(params) {
        this.type = 'fsmComponent';

        // The registered states
        this.fsm = params.fsm || new FSM();
    }

    FsmComponent.prototype = Object.create(Component.prototype);

    FsmComponent.prototype.addState = function(stateName, behavior) {
        console.log('Add state: ', stateName);

        // Return if the state already exists
        if(this._states[stateName]) return;

        // Set empty function if behavior function is missing
        if(!behavior) behavior = function(evt) { };

        // Create state
        this._states[stateName] = behavior;
    };

    FsmComponent.prototype.deleteState = function(stateName) {
        console.log('Delete state: ', stateName);

        // Return if the state doesn't exist
        if(!this._states[stateName]) return;

        // Delete state
        delete this._states[stateName];
    };

    FsmComponent.prototype.getStates = function() {
        return this._states;
    };

    FsmComponent.prototype.getState = function() {
        return this._state;
    };

    FsmComponent.prototype.setState = function(stateName) {
        if(!this._states[stateName]) {
            console.warn("There's no state called", stateName);
            return;
        }

        console.log('Changin state from', this._state , 'to', stateName);
        this._state = stateName;
    };    

    FsmComponent.prototype.process = function() {
        if(!this._state) {
            console.warn('Initial state not set.');
            return;
        }

        var _len = this._messageQueue.length;

        if(_len > 0) {
            for(var i = 0; i < _len; i++) {
                this._states[this._state](this.entity, this._messageQueue[i]);
            }

            this._messageQueue = [];
        } else {
            this._states[this._state](this.entity);
        }
    };

    FsmComponent.prototype.receiveMessage = function(message) {
        this._messageQueue.push(message);
    };

    return FsmComponent;
});