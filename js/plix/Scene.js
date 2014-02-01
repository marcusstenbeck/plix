define([
], function(
) {

	function Scene(options) {
		this.entities = [];
	}

	Scene.prototype.getEntityByType = function(type) {
		for(var i = 0; i < this.entities.length; i++) {
			if(this.entities[i].type == type) return this.entities[i];
		}
		return null;
	};

    return Scene;
});