define([
    'plix/Component'
], function(
    Component
) {

    function ScriptComponent() {
        this.type = 'scriptComponent';

        // Has a bunch of scripts that it runs.
        this.scripts = [];

        // Holds all the messages we've received since last run
        this.messages = [];
    }
    ScriptComponent.prototype = Object.create(Component.prototype);

    ScriptComponent.prototype.run = function(tpf) {
        for(var i = 0; i < this.scripts.length; i++) {
            this.scripts[i].run(this.entity, tpf, this.messages);
        }

        this.messages = [];
    };

    ScriptComponent.prototype.receiveMessage = function(message) {
        this.messages.push(message);
    };

    return ScriptComponent;
});