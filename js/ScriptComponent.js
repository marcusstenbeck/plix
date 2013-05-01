define([
    'Component'
], function(
    Component
) {

    function ScriptComponent() {
        this.type = 'scriptComponent';

        // Has a bunch of scripts that it runs.
        this.scripts = [];
    }
    ScriptComponent.prototype = Object.create(Component.prototype);

    ScriptComponent.prototype.run = function() {
        for(var i = 0; i < this.scripts.length; i++) {
            this.scripts[i].run(this.entity);
        }
    };

    return ScriptComponent;
});